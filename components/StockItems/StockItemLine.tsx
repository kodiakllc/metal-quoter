// /components/StockItems/StockItemLine.tsx
import { MoreHorizontal } from 'lucide-react';

import Image from 'next/image';

import { ProductDTO } from '@/types/dto';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';

interface StockItemLineProps {
  specification: Record<string, string>;
  quantityInStock: number;
  unitPrice: number;
  product: ProductDTO;
  createdAt: string;
  updatedAt: string;
}

const StockItemLine: React.FC<StockItemLineProps> = ({
  specification,
  quantityInStock,
  unitPrice,
  product: { name, description, category },
  createdAt,
  updatedAt,
}) => {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Image
            alt={`Stock item image of ${name}`}
            className="aspect-square rounded-md object-cover"
            height={64}
            src="/img/placeholder.svg"
            width={64}
          />
          <div>
            <h3 className="text-lg font-semibold">{name}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Badge>{category}</Badge>
          <Badge>{quantityInStock} in stock</Badge>
          <Badge>${unitPrice}</Badge>
        </div>
      </TableCell>
      <TableCell>{createdAt}</TableCell>
      <TableCell>{updatedAt}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default StockItemLine;
