// /utils/server/product.ts
import prisma from '@/lib/prisma-client-edge';
import { ProductDTO, StockItemDTO } from '@/types/dto';
import { Product, StockItem } from '@prisma/client';

// Function to convert a Product model to ProductDTO
export const toProductDTO = async (product: Product): Promise<ProductDTO> => {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
};

// below we take in a StockItem[] and return a StockItemDTO[], populating the product field via productId
export const toStockItemDTO = async (stockItem: StockItem): Promise<StockItemDTO> => {
  const product = await prisma.product.findUnique({ where: { id: stockItem.productId } });
  if (!product) throw new Error('Product not found');
  return {
    ...stockItem,
    specification: stockItem.specification as Record<string, string>,
    product: await toProductDTO(product),
    createdAt: stockItem.createdAt.toISOString(),
    updatedAt: stockItem.updatedAt.toISOString(),
  };
};
