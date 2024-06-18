// /types/dto/QuoteDTO.ts
import { RFQDTO } from "@/types/dto";

export interface QuoteDTO {
  customerEmail: string;
  customerName: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
  rfqId: number;
  totalPrice: number;
  deliveryOptions: string | null;
  paymentTerms: string;
  validityPeriod: string;
  additionalInformation: string | null;
  logicBehindThePrice: string | null;
  status: string;
  createdAt: string;
}

export interface RFQQuote {
  rfq: RFQDTO;
  quotes: QuoteDTO[];
}
