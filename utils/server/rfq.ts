// /utils/server/rfq.ts
import prisma from '@/lib/prisma-client-edge';
import { RFQDTO, RFQDetail } from '@/types/dto';
import { findCustomerById, findOrCreateCustomer } from '@/utils/server/customer';
import { Quote, RFQ } from '@prisma/client';
import { convertRFQToQuoteInstructions, runAssistant } from '@/utils/server/assistant';
import { s } from 'vitest/dist/env-afee91f0';

const getEmailToRFQMessage = (sender: string, recipient: string, subject: string, body: string) => {
  const message = `The below email contains a request for a quote (RFQ) for various metal products from a metal service center. The structured data will be used to create an RFQ in our system. You know what to do based on the instructions previous instructions provided; do not forget to extract the structured data from the email body EXACTLY as requested.

  The sender of the email is ${sender} and the recipient is ${recipient}. The subject of the email is "${subject}".

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
  };
};

const convertRFQToQuote = async (assistantId: string, rfq: RFQ):
Promise<{ quote: Quote, threadId: string }> => {
  const rfqDTO: RFQDTO = await toRFQDTO(rfq);

  // grab all the stock items from the database
  const stockItems = await prisma.stockItem.findMany();
  // fetch the product for each stock item
  const stockItemsWithProducts = await Promise.all(
    stockItems.map(async (stockItem) => {
      const product = await prisma.product.findUnique({
        where: { id: stockItem.productId },
      });

      return {
        ...stockItem,
        product: product || null,
      };
    })
  );

  const message = JSON.stringify({
    rfq: rfqDTO,
    stockItems: stockItemsWithProducts,
  });

  const { structuredData: quoteData, threadId } = await runAssistant(
    assistantId,
    null,
    convertRFQToQuoteInstructions,
    message
  );

  const quote = await prisma.quote.create({
    data: {
      ...quoteData,
      rfqId: rfq.id,
      customerId: rfq.customerId,
    },
  });

  return { quote, threadId };
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
  convertRFQToQuote,
  toRFQDTO,
  createRFQ,
}
