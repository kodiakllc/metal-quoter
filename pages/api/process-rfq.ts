// /pages/api/process-rfq.ts
import prisma from '@/lib/prisma-client';
import { NextApiRequest, NextApiResponse } from 'next';
import { sendQuoteToSlack, sendRFQToSlack } from '@/utils/server/slack';
import { rfqExtractionInstructions, runAssistant } from '@/utils/server/assistant';
import { getEmailToRFQMessage, createRFQ } from '@/utils/server/rfq';
import { convertRFQToQuote, quoteToQuoteDTO } from '@/utils/server/quote';
import { findCustomerThreadId } from '@/utils/server/customer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { emailId, assistantId, assistantThreadId } = req.body;

    // Fetch the email data from the database
    const email = await prisma.email.findUnique({
      where: { id: emailId },
    });

    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const { sender, recipient, subject, body } = email;

    // Extract the structured data from the email body
    const rfqExtractionMessage = getEmailToRFQMessage(sender, recipient, subject ?? '<No Subject>', body);

    // Check if the customer already has a thread, then create a new thread
    const existingThreadId = assistantThreadId ?? (await findCustomerThreadId(email.sender));
    // Run the assistant to extract the RFQ data
    const { structuredData: rfqData, threadId } = await runAssistant(
      assistantId,
      existingThreadId,
      rfqExtractionInstructions,
      {
        // using this model for the assistant, since I've had good results with it.
        model: 'gpt-4-1106-preview',
        // 1.42 and 0.85 paired together I have had excellent deterministic results with disorganized data.
        temperature: 1.42,
        top_p: 0.85,
      },
      rfqExtractionMessage
    );

    // Create the RFQ in the database
    const newRFQ = await createRFQ(rfqData);

    // Update customer with the thread id
    await prisma.customer.update({
      where: { id: newRFQ.customerId },
      data: { threadId: threadId },
    });

    // Send the RFQ data to Slack
    await sendRFQToSlack(rfqData);

    // Try to create a quote from the RFQ
    const { quote, threadId: newThreadId } = await convertRFQToQuote(assistantId, newRFQ);
    const quoteDTO = await quoteToQuoteDTO(quote);

    // Send the quote to Slack
    await sendQuoteToSlack(quoteDTO);

    return res.status(200).json({ message: 'RFQ and Quote processed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
