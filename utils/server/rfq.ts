// /utils/server/rfq.ts
import prisma from '@/lib/prisma-client-edge';
import { RFQDTO, RFQDetail } from '@/types/dto';
import { findCustomerById, findOrCreateCustomer } from '@/utils/server/customer';
import { RFQ } from '@prisma/client';

const getEmailToRFQMessage = (receivedAt: Date, sender: string, recipient: string, subject: string, body: string) => {
  const message = `The below email contains a request for a quote (RFQ) for various metal products from a metal service center. The structured data will be used to create an RFQ in our system. You know what to do based on the instructions previous instructions provided; do not forget to extract the structured data from the email body EXACTLY as requested.

  The email was received at ${receivedAt.toISOString()}. The sender of the email is ${sender} and the recipient is ${recipient}. The subject of the email is "${subject}".

  From the email content, extract the following details and return them as a JSON object:
  ${body}
  `;

  return message;
}

const toRFQDTO = async (rfq: RFQ): Promise<RFQDTO> => {
  const customer = await findCustomerById(rfq.customerId);

  if (!customer) {
    throw new Error(`Customer with ID ${rfq.customerId} not found`);
  }

  // Transform the details from the RFQ model into RFQDetail[]
  const details: RFQDetail[] = (rfq.details as any[]).map((detail) => ({
    name: detail.name,
    specification: detail.specification,
    quantity: detail.quantity,
  }));

  // Transform the custom processing requests from the RFQ model into CustomProcessingRequestDTO[]
  const customProcessingRequests = await prisma.customProcessingRequest.findMany({
    where: { rfqId: rfq.id },
  });

  return {
    customerEmail: customer.emailAddress,
    customerName: customer.companyName || '',
    contactPerson: customer.contactPerson || '',
    phoneNumber: customer.phoneNumber || '',
    address: customer.address || '',
    details: details,
    deliveryRequirements: rfq.deliveryRequirements || '',
    additionalServices: rfq.additionalServices || '',
    customProcessingRequests: customProcessingRequests.map((request) => ({
      processingType: request.processingType,
      specifications: request.specifications as Record<string, any>,
    })),
    createdAt: rfq.createdAt.toISOString(),
  };
};

const createRFQ = async (rfqData: RFQDTO) => {
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
  toRFQDTO,
  createRFQ,
}
