// /utils/server/slack.ts
import { RFQDTO, QuoteDTO } from '@/types/dto';

if (!process.env.SLACK_WEBHOOK_URL) {
  throw new Error('SLACK_WEBHOOK_URL is not defined');
}

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export const sendQuoteToSlack = async (quoteData: QuoteDTO) => {
  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: `Quote successfully created:\n
      - Customer Email: ${quoteData.customerEmail}\n
      - Customer Name: ${quoteData.customerName}\n
      - Contact Person: ${quoteData.contactPerson}\n
      - Phone Number: ${quoteData.phoneNumber}\n
      - Address: ${quoteData.address}\n
      - RFQ ID: ${quoteData.rfqId}\n
      - Total Price: $${quoteData.totalPrice.toFixed(2)}\n
      - Delivery Options: ${quoteData.deliveryOptions}\n
      - Payment Terms: ${quoteData.paymentTerms}\n
      - Validity Period: ${quoteData.validityPeriod}\n
      - Additional Information: ${quoteData.additionalInformation}\n
      - Logic Behind The Price: ${quoteData.logicBehindThePrice}\n
      - Status: ${quoteData.status}\n
      - Created At: ${quoteData.createdAt}`
    }),
  });
};


export const sendRFQToSlack = async (rfqData: RFQDTO) => {
  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application-json',
    },
    body: JSON.stringify({
      text: `RFQ successfully created:\n
      - RFQ ID: ${rfqData.id}\n
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
