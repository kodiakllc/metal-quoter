// /utils/server/quote.ts
import prisma from '@/lib/prisma-client-edge';
import { QuoteDTO, RFQDTO } from '@/types/dto';
import { findCustomerById } from '@/utils/server/customer';
import { Quote, RFQ } from '@prisma/client';
import { toRFQDTO } from '@/utils/server/rfq';
import { convertRFQToQuoteInstructions, runAssistant } from '@/utils/server/assistant';

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
    logicBehindThePrice: quote.logicBehindThePrice || '',
    status: quote.status,
  };
};

export {
  quoteToQuoteDTO,
  convertRFQToQuote,
};
