// pages/api/rfq-email.ts
import openai from '@/lib/openai';
import prisma from "@/lib/prisma-client-edge";
import { AssistantResponseFormat } from 'openai/resources/beta/threads/threads';

export const config = {
  runtime: 'edge',
};

const assistantInstructions = `
  You are a highly advanced AI model tasked with extracting structured data from the body of an email. The email contains a request for a quote (RFQ) for various metal products from a metal service center. The structured data will be used to create an RFQ in our system.

  From the email content, extract the following details and return them as a JSON object:

  1. **Customer Information:**
    - **customerEmail**: The email address of the customer.
    - **customerName**: The name of the company or customer making the request (or empty string).
    - **contactPerson**: The name of the person to contact at the customer's company (or empty string).
    - **phoneNumber**: The contact phone number of the customer (or empty string).
    - **address**: The physical address of the customer (or empty string).

  2. **Product Information:**
    - An array named \`products\`, where each product contains:
      - **name**: The name of the requested product (e.g., "Stainless Steel Sheets").
      - **specification**: An object containing the specifications of the product:
        - **grade**: The grade of the material.
        - **thickness**: The thickness of the material.
        - **width**: The width of the material.
        - **length**: The length of the material.
      - **quantity**: The quantity of the product requested.

  3. **Delivery Requirements:**
    - **deliveryRequirements**: Any delivery requirements specified by the customer (e.g., delivery location, due date).

  4. **Additional Services:**
    - **additionalServices**: Any additional services requested by the customer (e.g., custom cutting, certifications).

  Please format the extracted details into the following JSON structure:

  \`\`\`json
  {
    "customerEmail": "string",
    "customerName": "string",
    "contactPerson": "string",
    "phoneNumber": "string",
    "address": "string",
    "products": [
      {
        "name": "string",
        "specification": {
          "grade": "string",
          "thickness": "string",
          "width": "string",
          "length": "string"
        },
        "quantity": "number"
      }
    ],
    "deliveryRequirements": "string",
    "additionalServices": "string"
  }
  \`\`\`

  Make sure to parse the email content carefully and accurately fill out each field based on the provided information.

  Here is the email content:
  `

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
        // manually override all the parameters for the assistant
        instructions: assistantInstructions,
        response_format: 'json_object' as AssistantResponseFormat,
        temperature: 1.42,
        top_p: 0.85,
      }
    );

    // Extract the structured data from the assistant response
    if (run.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(
        run.thread_id
      );
      // since it will be a new thread, the only message with role 'assistant' will be the last one
      const assistantMessage = messages.data.find((message) => message.role === 'assistant');
      if (!assistantMessage) {
        throw new Error('No assistant message found.');
      }
      if (assistantMessage.content[0].type !== 'text') {
        throw new Error('Expected structured data in the last message.');
      }
      const structuredData = JSON.parse(assistantMessage.content[0].text.value);
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
