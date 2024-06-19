// /types/dto/StockItemDTO.ts
import { ProductDTO } from '@/types/dto';

export interface StockItemDTO {
  id: number;
  productId: number;
  specification: Record<string, string>;
  quantityInStock: number;
  unitPrice: number;
  product: ProductDTO;
  createdAt: string;
  updatedAt: string;
}
