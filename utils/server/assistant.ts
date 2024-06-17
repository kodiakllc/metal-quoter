// /utils/server/assistant.ts
import openai from '@/lib/openai';
import prisma from '@/lib/prisma-client-edge';
import { AssistantResponseFormat } from 'openai/resources/beta/threads/threads';

const rfqExtractionInstructions = `
  You are a highly advanced AI model tasked with extracting structured data from the body of an email. The email contains a request for a quote (RFQ) for various metal products from a metal service center. The structured data will be used to create an RFQ in our system.

  From the email content, extract the following details and return them as a JSON object:

  1. **Customer Information:**
    - **customerEmail**: The email address of the customer.
    - **customerName**: The name of the company or customer making the request (or empty string).
    - **contactPerson**: The name of the person to contact at the customer's company (or empty string).
    - **phoneNumber**: The contact phone number of the customer (or empty string).
    - **address**: The physical address of the customer (or empty string).

  2. **Product Information:**
    - An array named \`details\`, where each product contains:
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
    "details": [
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
    ], (or empty array if no details are specified)
    "deliveryRequirements": "string",
    "additionalServices": "string",
    "customProcessingRequests": [
      {
        "processingType": "string",
        "specifications": {
          "key": "value"
        }
      }
    ] (or empty array if no custom processing requests are specified)
  }
  \`\`\`

  Make sure to parse the email content carefully and accurately fill out each field based on the provided information. Ensure that the extracted data is structured correctly and follows the specified format.

  Ensure to scour all parts of the email body for any possible details (name, specification, quantity, etc.) and include them in the extracted data.

  Here is the email content:
  `;

const runAssistant = async (assistantId: string, assistantThreadId: string | null, assistantInstructions: string, userMessageContent: string): Promise<
{
  rfqData: any,
  threadId: string,
}> => {
  // First use assistantThreadId if it was provided, then check if the customer already has a thread, then create a new thread
  const threadId = assistantThreadId ?? (await openai.beta.threads.create({})).id;

  // Add a message to the thread
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: userMessageContent,
  });

  let run = await openai.beta.threads.runs.createAndPoll(
    threadId,
    {
      assistant_id: assistantId,
      // manually override all the parameters for the assistant
      // using this model for the assistant, since I've had good results with it.
      model: 'gpt-4-1106-preview',
      instructions: assistantInstructions,
      response_format: { type: 'json_object' } as AssistantResponseFormat,
      // 1.42 and 0.85 paired together I have had excellent deterministic results
      temperature: 1.42,
      top_p: 0.85,
    }
  );

  // Extract the structured data from the assistant response
  if (run.status === 'completed') {
    const messages = await openai.beta.threads.messages.list(
      run.thread_id
    );

    // Find the last message from the assistant
    const assistantMessage = messages.data.sort((a, b) => b.created_at - a.created_at).find((message) => message.role === 'assistant');

    if (!assistantMessage) {
      throw new Error('No assistant message found.');
    }

    // validate that the assistant message contains structured data
    if (assistantMessage.content[0].type !== 'text') {
      throw new Error('Expected structured data in the last message.');
    }

    // parse the structured data from the assistant message
    return {
      rfqData: JSON.parse(assistantMessage.content[0].text.value),
      threadId: run.thread_id,
    };
  } else {
    throw new Error('Assistant run did not complete successfully.');
  }
}

export {
  rfqExtractionInstructions,
  runAssistant,
};
