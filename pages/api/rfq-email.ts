// pages/api/rfq-email.ts
import openai from '@/lib/openai';
import prisma from "@/lib/prisma-client-edge";

export const config = {
  runtime: 'edge',
};

const constructAssistantMessage = (sender: string, recipient: string, subject: string, body: string) => {
  const message = `The below email contains a request for a quote (RFQ) for various metal products from a metal service center. The structured data will be used to create an RFQ in our system. You know what to do based on the instructions previous instructions provided; do not forget to extract the structured data from the email body exactly as requested.

  The sender of the email is ${sender} and the recipient is ${recipient}. The subject of the email is "${subject}".

  From the email content, extract the following details and return them as a JSON object:
  ${body}
  `;

  return message;
}

const handler = async (req: Request) => {
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
        receivedAt: receivedAt || new Date().toISOString(), // Use provided receivedAt or current timestamp
      },
    });

    // Create a thread if needed
    const threadId = assistantThreadId ?? (await openai.beta.threads.create({})).id;

    // Add a message to the thread
    const createdMessage = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: constructAssistantMessage(email.sender, email.recipient, email.subject ?? '', email.body),
    });

    let run = await openai.beta.threads.runs.createAndPoll(
      threadId,
      {
        assistant_id: assistantId,
        instructions: "Extract structured data from the email body as requested.",
      }
    );

    // Extract the structured data from the assistant response
    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(
        run.thread_id
      );
      // get the last message, which contains the structured data, and parse it
      const lastMessage = messages.data[messages.data.length - 1];
      // ensure the last message is structured data by checking the type
      if (lastMessage.content[0].type !== 'text') {
        throw new Error('Expected structured data in the last message.');
      }
      const structuredData = JSON.parse(lastMessage.content[0].text.value);
      return new Response(JSON.stringify(structuredData), { status: 200, statusText: 'OK' });
    } else {
      console.error('Assistant run failed:', run);
      return new Response('Assistant run failed', { status: 500, statusText: ''});
    }
  } catch (error) {
    console.error(error);
    return new Response('Error: ' + error?.toString(), { status: 500, statusText: '' });
  }
};

export default handler;
