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
      - **totalPrice**: The calculated total price based on the logic behind the price (must exactly match the total price calculated in step 1)
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
**System Prompt:**

### 🌟 Hello! Let’s Break Down the Quote Object and Ensure Everything’s on Point! 🌟

**From the text:** Let’s take a detailed look at your provided Quote object and validate it step by step.

#### Provided Quote Object:

\`\`\`json
{
  "customerId": "cloudforge@example.com",
  "rfqId": 41,
  "totalPrice": 6250.00,
  "deliveryOptions": "Deliver to Chicago, IL by MM/DD/YYYY, Need price for both pickup and delivery",
  "paymentTerms": "30 days net",
  "validityPeriod": "2024-07-19T02:18:06.550Z",
  "additionalInformation": "All requested items are available. Delivery options and associated costs need to be discussed with the customer.",
  "logicBehindThePrice": "The total price is calculated based on the unit prices and quantities of the requested items. Stainless Steel Sheets (50 units at $30/unit) total $1500. Aluminum Rods (100 units at $12.5/unit) total $1250. No custom processing requests were made. Total price is the sum of all items: $1500 + $1250 = $2750. Since the quantity of Aluminum Rods matches the available stock, it's assumed all can be supplied without delay.",
  "status": "draft",
  "createdAt": "2024-06-19T02:18:06.550Z"
}
\`\`\`

#### 🕵️ Validation Steps:

1. **Customer ID and RFQ ID:**
   - The \`customerId\` should be an integer representing the customer’s ID.
   - Here, it’s an email address (\`"cloudforge@example.com"\`), which needs to be corrected.

2. **Total Price Calculation:**
   - **Details from the provided quote:**
     - Stainless Steel Sheets: 50 units at $30/unit => $1500
     - Aluminum Rods: 100 units at $12.5/unit => $1250
   - **Calculated Total Price:**
     - Sum of $1500 (Stainless Steel Sheets) + $1250 (Aluminum Rods) = $2750
   - The provided total price (\`$6250.00\`) doesn’t match the calculated total ($2750.00).

3. **Delivery Options, Payment Terms, and Validity Period:**
   - The delivery options seem detailed but ensure the date format (\`MM/DD/YYYY\`) is correctly filled.
   - Payment terms (\`30 days net\`) and validity period (\`2024-07-19T02:18:06.550Z\`) are clear.

4. **Additional Information and Logic Behind the Price:**
   - The explanation for the price logic is clear and aligns with the detailed calculation provided.
   - However, it doesn’t justify the total price of \`$6250.00\`.

5. **Status and Creation Date:**
   - The status (\`draft\`) and creation date (\`2024-06-19T02:18:06.550Z\`) are appropriate.

### 🛠️ Corrected Quote Object:

Based on the validations, let’s adjust the \`customerId\` and ensure the \`totalPrice\` is accurate:

\`\`\`json
{
  "customerId": 1, // Assuming a valid integer ID
  "rfqId": 41,
  "totalPrice": 2750.00, // Corrected based on the detailed calculation
  "deliveryOptions": "Deliver to Chicago, IL by MM/DD/YYYY, Need price for both pickup and delivery",
  "paymentTerms": "30 days net",
  "validityPeriod": "2024-07-19T02:18:06.550Z",
  "additionalInformation": "All requested items are available. Delivery options and associated costs need to be discussed with the customer.",
  "logicBehindThePrice": "The total price is calculated based on the unit prices and quantities of the requested items. Stainless Steel Sheets (50 units at $30/unit) total $1500. Aluminum Rods (100 units at $12.5/unit) total $1250. No custom processing requests were made. Total price is the sum of all items: $1500 + $1250 = $2750. Since the quantity of Aluminum Rods matches the available stock, it's assumed all can be supplied without delay.",
  "status": "draft",
  "createdAt": "2024-06-19T02:18:06.550Z"
}
\`\`\`

### 🎉 Woohoo! Your Quote Object is Now Corrected! 🎉

Now, we do the same for this quote object, and only return the corrected quote object. Here is the quote object to validate and correct:
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
