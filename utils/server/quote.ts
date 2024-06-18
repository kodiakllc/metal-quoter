// /utils/server/quote.ts
import prisma from '@/lib/prisma-client-edge';
import { QuoteDTO, RFQDTO, RFQQuote } from '@/types/dto';
import { findCustomerById } from '@/utils/server/customer';
import { Quote, RFQ } from '@prisma/client';
import { toRFQDTO } from '@/utils/server/rfq';
import { convertRFQToQuoteInstructions, validatePotentialQuoteInstructions, runAssistant } from '@/utils/server/assistant';

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
    {
      model: 'gpt-4-1106-preview',
      // using a lower temperature for more deterministic results
      temperature: 0.5,
      top_p: 1,
    },
    message
  );

  // we loop the structured data back into the assistant again with the validatePotentialQuoteInstructions
  // to get the assistant to validate the quote data
  const { structuredData: quoteData2, threadId: validationThreadId } = await runAssistant(
    assistantId,
    threadId,
    validatePotentialQuoteInstructions,
    {
      model: 'gpt-4-1106-preview',
      temperature: 0.5,
      top_p: 1,
    },
    `The initial message is: \n\n` + message + `\n\n The quote data to validate is as follows: \n\n ${JSON.stringify(quoteData)}`
  );

  const quote = await prisma.quote.create({
    data: {
      ...quoteData2,
      rfqId: rfq.id,
      customerId: rfq.customerId,
    },
  });

  return { quote, threadId };
};

const toQuoteDTO = async (quote: Quote): Promise<QuoteDTO> => {
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
    id: quote.id,
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
    createdAt: quote.createdAt.toISOString(),
  };
};

const toRFQAndQuoteDTOs = async (rfqs: any[]): Promise<RFQQuote[]> => {
  const rfqsAndQuotes: RFQQuote[] = await Promise.all(
    rfqs.map(async (rfq) => {
      const rfqDTO = await toRFQDTO(rfq);
      const quotes = await Promise.all(rfq.quotes.map(async (q: Quote) => await toQuoteDTO(q)));
      return {
        rfq: rfqDTO,
        quotes: quotes,
      };
    })
  );

  return rfqsAndQuotes;
}

export {
  toQuoteDTO,
  toRFQAndQuoteDTOs,
  convertRFQToQuote,
};
