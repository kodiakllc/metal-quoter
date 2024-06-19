// /utils/server/assistant.ts
import openai from '@/lib/openai';
import { AssistantOptions } from '@/types/assistant';
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
    ], (or [] if no details are specified)
    "deliveryRequirements": "string",
    "additionalServices": "string",
    "customProcessingRequests": [
      {
        "processingType": "string",
        "specifications": {
          "key": "value"
        }
      }
    ], (or [] if no customProcessingRequests are specified)
    "createdAt": "DateTime"
  }
  \`\`\`

  Make sure to parse the email content carefully and accurately fill out each field based on the provided information. Ensure that the extracted data is structured correctly and follows the specified format.

  Ensure to scour all parts of the email body for any possible details (name, specification, quantity, etc.) and include them in the extracted data; do not miss any relevant information, and make sure to handle any edge cases that may arise.

  If there are any custom processing requests specified in the email, include them in the \`customProcessingRequests\` array by extrapolating the necessary information from the email content. If there are no custom processing requests, return an empty array ([]) for the \`customProcessingRequests\` field.

  Here is the email content:
  `;

  const convertRFQToQuoteInstructions = `
  You are a highly advanced AI model tasked with converting structured Request For Quote (RFQ) data into a structured Quote for the metal service center's system. The RFQ data includes details about the customer, requested products, delivery requirements, and any additional services.

  From the provided RFQ data, you will generate a structured Quote object. Ensure that all fields are filled out accurately based on the provided data and your calculations.

  Here is the structure of the RFQ data you will receive:
  \`\`\`json
  {
    "rfq": {
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
      ],
      "createdAt": "DateTime"
    }
  }
  \`\`\`

  Here is the structure of the Stock Items data you have access to:
  \`\`\`json
  {
    "stockItems": [
      {
        "productId": "int",
        "specification": {
          "grade": "string",
          "diameter": "string",
          "wallThickness": "string"
        },
        "quantityInStock": "int",
        "unitPrice": "float",
        "product": {
          "name": "string",
          "description": "string",
          "category": "string"
        },
      }
    ]
  }

  Your task is to generate a structured Quote object based on this RFQ data. Here are the steps you need to follow:

  1. **Calculate Total Price:**
    - For each product in the \`details\` array, check the stock availability and unit price from the available inventory data (you can assume that you have access to this inventory data).
    - Calculate the total price for each product by multiplying the quantity by the unit price.
    - Sum the prices of all products to get the overall total price.
    - If there are any custom processing requests, add additional costs based on the type of processing and specifications.

  2. **Create Quote Object:**
    - Include the following fields in the Quote object:
      - **customerId**: The ID of the customer.
      - **rfqId**: The ID of the RFQ.
      - **totalPrice**: The calculated total price for the quote.
      - **deliveryOptions**: Derived from the delivery requirements of the RFQ.
      - **paymentTerms**: Set standard payment terms (e.g., "30 days net").
      - **validityPeriod**: The period for which the quote is valid (e.g., 30 days from the current date).
      - **additionalInformation**: Any additional information derived from the RFQ or standard information.
      - **logicBehindThePrice**: A brief explanation of how the total price was calculated, including any additional costs, and be very specific and detailed, but also concise.
      - **status**: Set the status of the quote to "draft".

  3. **Handle Stock Availability & Pricing:**
    - Check the availability of each product in the inventory data.
    - If the quantity requested exceeds the available stock, provide a message in the additional information field indicating the unavailability of the product and any possible alternatives.
    - If the product is available, provide the unit price and calculate the total price based on the quantity requested; ensure to include this information in the Quote object.
    - To calculate the total price, multiply the quantity by the unit price for each product, also considering any custom processing requests, if applicable.
    - Additionally, you must must think "step by step" and provide a detailed explanation of the logic behind the price calculation.
    - YOU MUST NOT MISS ANY DETAILS, and you must be very specific and accurate in your calculations, and you must provide a detailed explanation of the logic behind the price calculation.
    - Second to last, you must ensure you have accounted for any delivery costs in the total price calculation.
    - The previous step is very important, and you must ensure that you have accounted for any delivery costs in the total price calculation.
    - Finally, it is critical that you are accurate and precise in your calculations and explanations, ensuring that the Quote object is correctly formatted and contains all the necessary information.

  4. **Format the Quote Object:**
    - Ensure that the Quote object matches the following JSON structure:

  \`\`\`json
  {
    "customerId": "int",
    "rfqId": "int",
    "totalPrice": "float",
    "deliveryOptions": "string",
    "paymentTerms": "string",
    "validityPeriod": "DateTime",
    "additionalInformation": "string",
    "logicBehindThePrice": "string",
    "status": "string",
    "createdAt": "DateTime"
  }
  \`\`\`

  Here is the structured RFQ data for which you need to generate a Quote:
`;

const validatePotentialQuoteInstructions = `
  You are a highly advanced AI model tasked with validating a potential Quote generated by the system. The Quote object contains details about the customer, total price, delivery options, payment terms, validity period, additional information, logic behind the price, and status.

  Your task is to carefully review the provided Quote object and ensure that all the fields are correctly filled out based on the RFQ data and the stock availability. You must validate the total price calculation, the delivery options, the payment terms, the validity period, and the logic behind the price.

  Here is the structure of the Quote object you will receive:
  \`\`\`json
  {
    "customerId": "int",
    "rfqId": "int",
    "totalPrice": "float",
    "deliveryOptions": "string",
    "paymentTerms": "string",
    "validityPeriod": "DateTime",
    "additionalInformation": "string",
    "logicBehindThePrice": "string",
    "status": "string",
    "createdAt": "DateTime"
  }
  \`\`\`

  Here are the steps you need to follow to validate the Quote object:

  1. **Check Total Price:**
    - Verify that the total price is calculated correctly based on the unit prices of the products and any additional costs for custom processing requests.
    - Ensure that the total price matches the sum of the prices of all products and any additional costs.

  2. **Validate Delivery Options:**
    - Check that the delivery options are derived correctly from the delivery requirements of the RFQ.
    - Ensure that the delivery options are accurately represented in the Quote object.

  3. **Review Payment Terms:**
    - Validate that the payment terms are set to standard terms (e.g., "30 days net").
    - Ensure that the payment terms are correctly specified in the Quote object.

  4. **Verify Validity Period:**
    - Check that the validity period is set to a reasonable duration (e.g., 30 days from the current date).
    - Ensure that the validity period is correctly formatted in the Quote object.

  5. **Examine Additional Information:**
    - Review any additional information provided in the Quote object.
    - Ensure that the additional information is relevant and accurate based on the RFQ data and stock availability.

  6. **Evaluate Logic Behind The Price:**
    - Carefully read the explanation of the logic behind the price.
    - Verify that the explanation is detailed, specific, and concise, providing a clear breakdown of how the total price was calculated, including any additional costs.

  7. **Confirm Status:**
    - Check that the status of the Quote is set to "draft."
    - Ensure that the status accurately reflects the state of the Quote object.

  8. **Provide Feedback:**
    - If any discrepancies are found in the Quote object, adjust them and return the exact same structure with the corrected values.
    - If the Quote object is accurate and correctly filled out, return the same structure without any modifications.

  9. **Be Thorough:**
    - It is crucial that you carefully review each field of the Quote object and provide detailed feedback on any issues found.
    - Ensure that the Quote object is correctly formatted and contains all the necessary information for further processing.

  10. **Accuracy is Key:**
    - Your validation must be accurate and precise, ensuring that the Quote object is valid and ready for approval.

  Here is the Quote object you need to validate:
`;

const runAssistant = async (assistantId: string, assistantThreadId: string | null, assistantInstructions: string, assistantOptions: AssistantOptions, userMessageContent: string): Promise<
{
  structuredData: any,
  threadId: string,
}> => {
  // First use assistantThreadId if it was provided, otherwise create a new thread
  const threadId = assistantThreadId ?? (await openai.beta.threads.create({})).id;

  // Add a message to the thread
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: userMessageContent,
  });

  let run = await openai.beta.threads.runs.createAndPoll(
    threadId,
    {
      // manually override all the parameters for the assistant
      assistant_id: assistantId,
      instructions: assistantInstructions,
      response_format: { type: 'json_object' } as AssistantResponseFormat,
      ...assistantOptions,
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
      structuredData: JSON.parse(assistantMessage.content[0].text.value),
      threadId: run.thread_id,
    };
  } else {
    throw new Error('Assistant run did not complete successfully.');
  }
}

export {
  rfqExtractionInstructions,
  convertRFQToQuoteInstructions,
  validatePotentialQuoteInstructions,
  runAssistant,
};
