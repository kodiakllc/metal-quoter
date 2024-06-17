// /types/dto/rFQDTO.ts
import { CustomProcessingRequestDTO } from '@/types/dto';

export interface Details {
  name: string;
  specification: Record<string, string>;
  quantity: number;
}

export interface rFQDTO {
  customerEmail: string;
  customerName: string;
  contactPerson: string;
  phoneNumber: string;
  address: string;
  details?: Details[];
  deliveryRequirements: string | null;
  additionalServices: string | null;
  customProcessingRequests?: CustomProcessingRequestDTO[];
}
