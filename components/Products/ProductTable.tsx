// /components/Products/ProductTable.tsx
import {
  ChevronLeft,
  ChevronRight,
  File,
  ListFilter,
  PlusCircle,
} from 'lucide-react';
import React, { useState } from 'react';

import { ProductDTO } from '@/types/dto/ProductDTO';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ProductLine from './ProductLine';

interface ProductTableProps {
  products: ProductDTO[];
}

const ProductTable: React.FC<ProductTableProps> = ({ products }) => {
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(products.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <Tabs defaultValue="all">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="archived" className="hidden sm:flex">
              Archived
            </TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Active
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button size="sm" className="h-8 gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Product
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="all">
          <Card x-chunk="dashboard-06-chunk-0">
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your products and keep track of their details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Created at
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Updated at
                    </TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProducts.map((product) => (
                    <ProductLine
                      key={product.id}
                      name={product.name}
                      description={product.description}
                      category={product.category}
                      createdAt={product.createdAt}
                      updatedAt={product.updatedAt}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex flex-row items-center justify-between border-t bg-muted/50 px-6 py-3">
              <div className="text-xs text-muted-foreground">
                Showing{' '}
                <strong>
                  {startIndex + 1}-
                  {Math.min(products.length, startIndex + itemsPerPage)}
                </strong>{' '}
                of <strong>{products.length}</strong> products
              </div>
              <Pagination className="ml-auto mr-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      <span className="sr-only">Previous Page</span>
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-6 w-6"
                      onClick={handleNextPage}
                      disabled={
                        currentPage ===
                        Math.ceil(products.length / itemsPerPage)
                      }
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                      <span className="sr-only">Next Page</span>
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default ProductTable;
