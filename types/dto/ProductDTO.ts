// /types/dto/ProductDTO.ts
export interface ProductDTO {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}
