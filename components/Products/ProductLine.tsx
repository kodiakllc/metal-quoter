// /components/Products/ProductLine.tsx
import { MoreHorizontal } from 'lucide-react';

import Image from 'next/image';

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

interface ProductLineProps {
  name: string;
  description: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

const ProductLine: React.FC<ProductLineProps> = ({
  name,
  description,
  category,
  createdAt,
  updatedAt,
}) => {
  return (
    <TableRow>
      <TableCell className="hidden sm:table-cell">
        <Image
          alt={`Product image of ${name}`}
          className="aspect-square rounded-md object-cover"
          height={64}
          src="/placeholder.svg"
          width={64}
        />
      </TableCell>
      <TableCell className="font-medium">{name}</TableCell>
      {/* <TableCell>
        <Badge variant="outline">{status}</Badge>
      </TableCell> */}
      <TableCell className="hidden md:table-cell">
        ${description ? description : 'No description'}
      </TableCell>
      <TableCell className="hidden md:table-cell">{category}</TableCell>
      <TableCell className="hidden md:table-cell">{createdAt}</TableCell>
      <TableCell className="hidden md:table-cell">{updatedAt}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default ProductLine;
