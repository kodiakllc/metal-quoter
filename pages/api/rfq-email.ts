// /pages/api/rfq-email.ts
import prisma from "@/lib/prisma-client-edge";
import { sendQuoteToSlack, sendRFQToSlack } from '@/utils/server/slack';
import { rfqExtractionInstructions, runAssistant } from '@/utils/server/assistant';
import { getEmailToRFQMessage, createRFQ } from '@/utils/server/rfq';
import { convertRFQToQuote } from '@/utils/server/quote';
import { quoteToQuoteDTO } from '@/utils/server/quote';
import { findCustomerThreadId } from '@/utils/server/customer';

export const config = {
  runtime: 'edge',
};

const POST = async (req: Request) => {
  try {
    const { sender, recipient, subject, body, receivedAt, assistantId, assistantThreadId } = await req.json();

    // Ensure required fields are present
    if (!sender || !recipient || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Insert the email data into the database using Prisma
    const email = await prisma.email.create({
      data: {
        sender,
        recipient,
        subject,
        body,
        receivedAt: receivedAt || new Date().toISOString(),
      },
    });

    // Extract the structured data from the email body
    const rfqExtractionMessage = getEmailToRFQMessage(sender, recipient, subject, body);

    // Check if the customer already has a thread, then create a new thread
    const existingThreadId = assistantThreadId ?? (await findCustomerThreadId(email.sender));
    // Run the assistant to extract the RFQ data
    const { structuredData: rfqData, threadId } = await runAssistant(assistantId, existingThreadId, rfqExtractionInstructions, rfqExtractionMessage);

    // create the RFQ in the database
    const newRFQ = await createRFQ(rfqData);

    // update customer with the thread id
    await prisma.customer.update({
      where: { id: newRFQ.customerId },
      data: { threadId: threadId },
    });

    // Send the RFQ data to Slack
    await sendRFQToSlack(rfqData);

    // try to create a quote from the RFQ
    const { quote, threadId: newThreadId } = await convertRFQToQuote(assistantId, newRFQ);
    const quoteDTO = await quoteToQuoteDTO(quote);

    // send the quote to slack
    await sendQuoteToSlack(quoteDTO);

    // return the extracted data as a response
    return new Response(JSON.stringify(rfqData), { status: 200, statusText: 'OK' });
  } catch (error) {
    console.error(error);
    return new Response('Error: ' + error?.toString(), { status: 500, statusText: '' });
  }
};

export default POST;
