// /utils/server/quote.ts
import prisma from '@/lib/prisma-client-edge';
import { QuoteDTO } from '@/types/dto';
import { findCustomerById } from '@/utils/server/customer';
import { Quote } from '@prisma/client';

const quoteToQuoteDTO = async (quote: Quote): Promise<QuoteDTO> => {
  const customer = await findCustomerById(quote.customerId);

  if (!customer) {
    throw new Error(`Customer with ID ${quote.customerId} not found`);
  }

  const rfq = await prisma.rFQ.findUnique({
    where: { id: quote.rfqId },
  });

  if (!rfq) {
    throw new Error(`RFQ with ID ${quote.rfqId} not found`);
  }

  return {
    customerEmail: customer.emailAddress,
    customerName: customer.companyName || '',
    contactPerson: customer.contactPerson || '',
    phoneNumber: customer.phoneNumber || '',
    address: customer.address || '',
    rfqId: quote.rfqId,
    totalPrice: quote.totalPrice,
    deliveryOptions: quote.deliveryOptions || '',
    paymentTerms: quote.paymentTerms,
    validityPeriod: quote.validityPeriod.toISOString(),
    additionalInformation: quote.additionalInformation || '',
    status: quote.status,
  };
};

export {
  quoteToQuoteDTO,
};
