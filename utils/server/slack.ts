// /utils/server/slack.ts
import { rFQDTO } from '@/types/dto';

if (!process.env.SLACK_WEBHOOK_URL) {
  throw new Error('SLACK_WEBHOOK_URL is not defined');
}

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export const sendRFQToSlack = async (rfqData: rFQDTO) => {
  await fetch(SLACK_WEBHOOK_URL, {
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
