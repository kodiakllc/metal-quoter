// /components/RFQDashboard/RFQDashboard.tsx
import { ChevronLeft, ChevronRight, Copy, CreditCard, File, Home, LineChart, ListFilter, MoreVertical, Package, Package2, PanelLeft, Search, Settings, ShoppingCart, Truck, Users2 } from 'lucide-react';
import React, { useState } from 'react';



import Image from 'next/image';
import Link from 'next/link';



import { RFQQuote } from '@/types/dto';



import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';



import RFQQuoteDetail from './RFQQuoteDetail';


interface RFQDashboardProps {
  rfqsAndQuotes: RFQQuote[];
}

const RFQDashboard: React.FC<RFQDashboardProps> = ({ rfqsAndQuotes }) => {
  const [selectedRFQIndex, setSelectedRFQIndex] = useState(0);
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState(0);

  const handleRFQClick = (rfqIndex: number) => {
    setSelectedRFQIndex(rfqIndex);
    setSelectedQuoteIndex(0); // Reset to the first quote when selecting a new RFQ
  };

  const handleQuoteChange = (quoteIndex: number) => {
    setSelectedQuoteIndex(quoteIndex);
  };

  const selectedRFQ =
    rfqsAndQuotes.length > 0 ? rfqsAndQuotes[selectedRFQIndex].rfq : null;
  const selectedQuote =
    rfqsAndQuotes.length > 0
      ? rfqsAndQuotes[selectedRFQIndex].quotes[selectedQuoteIndex]
      : null;

  const todoCardsEnabled = false;
  const todoDivEnabled = false;

  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        {todoDivEnabled && (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {todoCardsEnabled && (
              <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                  <CardTitle>Your RFQs</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Introducing Our Dynamic RFQs Dashboard for Seamless
                    Management and Insightful Analysis.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button>Create New RFQ</Button>
                </CardFooter>
              </Card>
            )}
            {todoCardsEnabled && (
              <Card x-chunk="dashboard-05-chunk-1">
                <CardHeader className="pb-2">
                  <CardDescription>This Week</CardDescription>
                  <CardTitle className="text-4xl">$1,329</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    +25% from last week
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={25} aria-label="25% increase" />
                </CardFooter>
              </Card>
            )}
            {todoCardsEnabled && (
              <Card x-chunk="dashboard-05-chunk-2">
                <CardHeader className="pb-2">
                  <CardDescription>This Month</CardDescription>
                  <CardTitle className="text-4xl">$5,329</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    +10% from last month
                  </div>
                </CardContent>
                <CardFooter>
                  <Progress value={12} aria-label="12% increase" />
                </CardFooter>
              </Card>
            )}
          </div>
        )}
        <Tabs defaultValue="week">
          <div className="flex items-center">
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 text-sm"
                  >
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only">Filter</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem checked>
                    Fulfilled
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Declined</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem>Refunded</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" className="h-7 gap-1 text-sm">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Export</span>
              </Button>
            </div>
          </div>
          <TabsContent value="week">
            <Card x-chunk="dashboard-05-chunk-3">
              <CardHeader className="px-7">
                <CardTitle>RFQs</CardTitle>
                <CardDescription>Recent requests for quotation</CardDescription>
              </CardHeader>
              <CardContent>
                {rfqsAndQuotes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Type
                        </TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Date
                        </TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rfqsAndQuotes.map((rfqQuote, rfqIndex) => (
                        <TableRow
                          key={rfqIndex}
                          onClick={() => handleRFQClick(rfqIndex)}
                          className={`${
                            rfqIndex === selectedRFQIndex ? 'bg-accent' : ''
                          } cursor-pointer`}
                        >
                          <TableCell>
                            <div className="font-medium">
                              {rfqQuote.rfq.customerName.length > 0
                                ? rfqQuote.rfq.customerName
                                : rfqQuote.rfq.contactPerson}
                            </div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                              {rfqQuote.rfq.customerEmail}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {rfqQuote.rfq.details
                              .map((detail) => detail.name)
                              .join(', ')}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge className="text-xs" variant="secondary">
                              {rfqQuote.rfq.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(
                              rfqQuote.rfq.createdAt,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {rfqQuote.quotes.length > 0
                              ? rfqQuote.quotes[0].totalPrice.toLocaleString(
                                  'en-US',
                                  {
                                    style: 'currency',
                                    currency: 'USD',
                                  },
                                )
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p>No RFQs available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <div className="flex flex-col w-full">
        {selectedRFQ && selectedQuote ? (
          <>
            <div className="mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full">
                    Select Quote
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {rfqsAndQuotes[selectedRFQIndex].quotes.map(
                    (quote, quoteIndex) => (
                      <DropdownMenuItem
                        key={quoteIndex}
                        onClick={() => handleQuoteChange(quoteIndex)}
                      >
                        Quote {quoteIndex + 1} -{' '}
                        {quote.totalPrice.toLocaleString('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        })}
                      </DropdownMenuItem>
                    ),
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <RFQQuoteDetail rfq={selectedRFQ} quote={selectedQuote} />
          </>
        ) : (
          <>
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 py-12">
              <Card x-chunk="dashboard-05-chunk-6">
                <CardHeader className="px-7">
                  <CardTitle>Quote</CardTitle>
                  <CardDescription>
                    Select a quote from the list to view details
                  </CardDescription>
                </CardHeader>
                <CardContent>Please select an RFQ from the list.</CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default RFQDashboard;
