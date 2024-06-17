// /types/dto/ProductDTO.ts
import { StockItemDTO } from '@/types/dto';

export interface ProductDTO {
  id: number;
  name: string;
  description?: string;
  category?: string;
  stockItems?: StockItemDTO[];
  createdAt: string;
  updatedAt: string;
}
