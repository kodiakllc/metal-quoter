// /types/dto/ProductDTO.ts
import { StockItemDTO } from '@/types/dto';

export interface ProductDTO {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  stockItems?: StockItemDTO[];
  createdAt: string;
  updatedAt: string;
}
