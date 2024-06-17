// /pages/api/rfq-email.ts
import openai from '@/lib/openai';
import prisma from "@/lib/prisma-client-edge";
import { AssistantResponseFormat } from 'openai/resources/beta/threads/threads';
import { rFQDTO } from '@/types/dto';

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
    ],
    "deliveryRequirements": "string",
    "additionalServices": "string",
    "customProcessingRequests": [
      {
        "processingType": "string",
        "specifications": {
          "key": "value"
        }
      }
    ]
  }
  \`\`\`

  Make sure to parse the email content carefully and accurately fill out each field based on the provided information.

  Here is the email content:
  `

const getEmailToRFQMessage = (sender: string, recipient: string, subject: string, body: string) => {
  const message = `The below email contains a request for a quote (RFQ) for various metal products from a metal service center. The structured data will be used to create an RFQ in our system. You know what to do based on the instructions previous instructions provided; do not forget to extract the structured data from the email body exactly as requested.

  The sender of the email is ${sender} and the recipient is ${recipient}. The subject of the email is "${subject}".

  From the email content, extract the following details and return them as a JSON object:
  ${body}
  `;

  return message;
}

const findCustomerThreadId = async (customerEmail: string) => {
  const customer = await prisma.customer.findFirst({
    where: { emailAddress: customerEmail },
  });

  return customer?.threadId ?? null;
}

const sendRFQToSlack = async (rfqData: rFQDTO) => {
  await fetch('https://hooks.slack.com/services/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', {
    method: 'POST',
    headers: {
      'Content-Type': 'application-json',
    },
    body: JSON.stringify({
      text: `RFQ successfully created:\n
      - Customer Email: ${rfqData.customerEmail}\n
      - Customer Name: ${rfqData.customerName}\n
      - Contact Person: ${rfqData.contactPerson}\n
      - Phone Number: ${rfqData.phoneNumber}\n
      - Address: ${rfqData.address}\n
      - Details: \`\`\`${JSON.stringify(rfqData.details)}\`\`\`\n
      - Delivery Requirements: ${rfqData.deliveryRequirements}\n
      - Additional Services: ${rfqData.additionalServices}\n
      - Custom Processing Requests: \`\`\`${JSON.stringify(rfqData.customProcessingRequests)}\`\`\``
    })
  });
}

const findOrCreateCustomer = (customerEmail: string, customerName: string, contactPerson: string, phoneNumber: string, address: string) => {
  return prisma.customer.upsert({
    where: { emailAddress: customerEmail },
    update: {},
    create: {
      companyName: customerName,
      contactPerson,
      emailAddress: customerEmail,
      phoneNumber,
      address,
    },
  });
}

const createRFQ = async (rfqData: rFQDTO) => {
  const customer = await findOrCreateCustomer(rfqData.customerEmail, rfqData.customerName, rfqData.contactPerson, rfqData.phoneNumber, rfqData.address);

  const details = rfqData.details?.map((detail) => ({
    name: detail.name,
    specification: JSON.stringify(detail.specification),
    quantity: detail.quantity,
  }));

  const customProcessingRequests = rfqData.customProcessingRequests?.map((request) => ({
    processingType: request.processingType,
    specifications: JSON.stringify(request.specifications),
  }));

  const rfq = await prisma.rFQ.create({
    data: {
      customerId: customer.id,
      details: JSON.stringify(details),
      deliveryRequirements: rfqData.deliveryRequirements,
      customProcessingRequests: {
        create: customProcessingRequests,
      },
    },
  });

  return rfq;
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

    // First use assistantThreadId if it was provided, then check if the customer already has a thread, then create a new thread
    const threadId = assistantThreadId ?? (await findCustomerThreadId(email.sender)) ?? (await openai.beta.threads.create({})).id;

    // Add a message to the thread
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: getEmailToRFQMessage(email.sender, email.recipient, email.subject ?? '', email.body),
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
      const assistantMessage = messages.data.sort((a, b) => a.created_at - b.created_at).find((message) => message.role === 'assistant');

      if (!assistantMessage) {
        throw new Error('No assistant message found.');
      }

      // validate that the assistant message contains structured data
      if (assistantMessage.content[0].type !== 'text') {
        throw new Error('Expected structured data in the last message.');
      }

      // parse the structured data from the assistant message
      const rfqData = JSON.parse(assistantMessage.content[0].text.value);

      // create the RFQ in the database
      const newRFQ = await createRFQ(rfqData);

      // update customer with the thread id
      await prisma.customer.update({
        where: { id: newRFQ.customerId },
        data: { threadId: run.thread_id },
      });

      // Send the RFQ data to Slack
      await sendRFQToSlack(rfqData);

      // return the extracted data as a response
      return new Response(JSON.stringify(rfqData), { status: 200, statusText: 'OK' });
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
