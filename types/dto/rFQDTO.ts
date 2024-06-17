// /types/dto/rFQDTO.ts
import { CustomProcessingRequestDTO } from '@/types/dto';

export interface RFQDetail {
  name: string;
  specification: Record<string, any>;
  quantity: number;
}

export interface RFQDTO {
  customerEmail: string;
  customerName: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
  details: RFQDetail[];
  deliveryRequirements: string | null;
  additionalServices: string | null;
  customProcessingRequests: CustomProcessingRequestDTO[];
}
