// /utils/server/rfq.ts
import prisma from '@/lib/prisma-client-edge';
import { rFQDTO } from '@/types/dto';
import { findOrCreateCustomer } from '@/utils/server/customer';

const getEmailToRFQMessage = (sender: string, recipient: string, subject: string, body: string) => {
  const message = `The below email contains a request for a quote (RFQ) for various metal products from a metal service center. The structured data will be used to create an RFQ in our system. You know what to do based on the instructions previous instructions provided; do not forget to extract the structured data from the email body EXACTLY as requested.

  The sender of the email is ${sender} and the recipient is ${recipient}. The subject of the email is "${subject}".

  From the email content, extract the following details and return them as a JSON object:
  ${body}
  `;

  return message;
}

const createRFQ = async (rfqData: rFQDTO) => {
  const customer = await findOrCreateCustomer(rfqData.customerEmail, rfqData.customerName, rfqData.contactPerson, rfqData.phoneNumber, rfqData.address);

  const details = rfqData.details?.map((detail) => ({
    name: detail.name,
    specification: detail.specification,
    quantity: detail.quantity,
  })) ?? [];

  const customProcessingRequests = rfqData.customProcessingRequests?.map((request) => ({
    processingType: request.processingType,
    specifications: request.specifications,
  })) ?? [];

  const rfq = await prisma.rFQ.create({
    data: {
      customerId: customer.id,
      details: details,
      deliveryRequirements: rfqData.deliveryRequirements,
      customProcessingRequests: {
        create: customProcessingRequests,
      },
    },
  });

  return rfq;
}

export {
  getEmailToRFQMessage,
  createRFQ,
}
