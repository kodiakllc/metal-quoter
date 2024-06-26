// /components/RFQDashboard/RFQQuoteDetail.tsx
import {
  Ban,
  ChevronLeft,
  ChevronRight,
  CircleCheckBig,
  Copy,
  MoreVertical,
  Send,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

import { approveQuote, unapproveQuote } from '@/utils/app/api';

import { QuoteDTO, RFQDTO } from '@/types/dto';

import { Badge } from '@/components/ui/badge';
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination';
import { Separator } from '@/components/ui/separator';

interface RFQQuoteDetailProps {
  rfq: RFQDTO;
  quote?: QuoteDTO;
  updateRFQ: (rfq: RFQDTO) => void;
  updateQuote: (quote: QuoteDTO) => void;
}

const RFQQuoteDetail: React.FC<RFQQuoteDetailProps> = ({
  rfq,
  quote,
  updateRFQ,
  updateQuote,
}) => {
  useEffect(() => {
    if (!quote) {
      toast.error('Quote data is missing');
    }
  }, [quote]);

  const handleQuoteStatusChange = async (status: 'approved' | 'unapproved') => {
    if (!quote) return;

    try {
      if (status === 'approved') {
        await approveQuote(quote.id);
        toast.success('Quote approved successfully');
        // refresh the quote status or update state here:
        updateQuote({ ...quote, status: 'approved' });
      } else if (status === 'unapproved') {
        await unapproveQuote(quote.id);
        toast.success('Quote unapproved successfully');
        // refresh the quote status or update state here:
        updateQuote({ ...quote, status: 'draft' });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while approving the quote');
      }
    }
  };

  return (
    <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            RFQ # {rfq.id}
            <Button
              size="icon"
              variant="outline"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
              <span className="sr-only">Copy IDs</span>
            </Button>
          </CardTitle>
          <CardDescription>
            RFQ Date:{' '}
            {new Date(rfq.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            <br />
            Quote Date:{' '}
            {quote
              ? new Date(quote.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : 'N/A'}
          </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {quote?.status === 'draft' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 hover:bg-green-700"
              onClick={() => handleQuoteStatusChange('approved')}
            >
              <CircleCheckBig className="h-3.5 w-3.5" />
              <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                Approve Quote
              </span>
            </Button>
          )}
          {/* below we have an unapprove button */}
          {quote?.status === 'approved' && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1 hover:bg-red-700"
              onClick={() => handleQuoteStatusChange('unapproved')}
            >
              <Ban className="h-3.5 w-3.5" />
              <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                Unapprove Quote
              </span>
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Send className="h-3.5 w-3.5" />
            <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
              Send Quote
            </span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <MoreVertical className="h-3.5 w-3.5" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Export</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Trash</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-3">
              <div className="font-semibold">Requested Item</div>
              <ul className="grid gap-3">
                {rfq.details.map((detail, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{detail.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-3">
              <div className="font-semibold">Requested Quantity</div>
              <ul className="grid gap-3">
                {rfq.details.map((detail, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{detail.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Separator className="my-2" />
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Delivery Requirements
              </span>
              <span className="text-right">{rfq.deliveryRequirements}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Additional Services</span>
              <span className="text-right">{rfq.additionalServices}</span>
            </li>
          </ul>
        </div>
        <Separator className="my-4" />
        {quote ? (
          <div className="grid gap-3">
            <div className="font-semibold">Quote Details</div>
            <ul className="grid gap-3">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Price</span>
                <span className="text-right">
                  {quote.totalPrice.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Delivery Options</span>
                <span className="text-right">{quote.deliveryOptions}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Payment Terms</span>
                <span className="text-right">{quote.paymentTerms}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Validity Period</span>
                <span className="text-right">
                  until{' '}
                  {new Date(quote.validityPeriod).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Additional Information
                </span>
                <span className="text-right">
                  {quote.additionalInformation}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Logic Behind The Price
                </span>
                <span className="text-right">{quote.logicBehindThePrice}</span>
              </li>
              <li className="flex items-center justify-between font-semibold">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  className={quote.status === 'approved' ? 'bg-green-700' : quote.status === 'denied' ? 'bg-red-700' : ''}
                  variant="outline"
                >
                  {quote.status}
                </Badge>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32">
            <span className="text-muted-foreground">Quote data is missing</span>
          </div>
        )}
        <Separator className="my-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-3">
            <div className="font-semibold">Shipping Information</div>
            <address className="grid gap-0.5 not-italic text-muted-foreground">
              <span>{rfq.customerName}</span>
              <span>{rfq.address}</span>
            </address>
          </div>
          <div className="grid auto-rows-max gap-3">
            <div className="font-semibold">Billing Information</div>
            <div className="text-muted-foreground">
              Same as shipping address
            </div>
          </div>
        </div>
        <Separator className="my-4" />
        <div className="grid gap-3">
          <div className="font-semibold">Customer Information</div>
          <dl className="grid gap-3">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Customer</dt>
              {rfq.customerName.length > 0 ? (
                <dd>
                  {rfq.customerName} ({rfq.contactPerson})
                </dd>
              ) : (
                <dd>{rfq.contactPerson}</dd>
              )}
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd>
                <a href={`mailto:${rfq.customerEmail}`}>{rfq.customerEmail}</a>
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Phone</dt>
              <dd>
                <a href={`tel:${rfq.phoneNumber}`}>{rfq.phoneNumber}</a>
              </dd>
            </div>
          </dl>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
        <div className="text-xs text-muted-foreground">
          Updated{' '}
          {new Date(rfq.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
        <Pagination className="ml-auto mr-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <Button size="icon" variant="outline" className="h-6 w-6">
                <ChevronLeft className="h-3.5 w-3.5" />
                <span className="sr-only">Previous RFQ</span>
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button size="icon" variant="outline" className="h-6 w-6">
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="sr-only">Next RFQ</span>
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardFooter>
    </Card>
  );
};

export default RFQQuoteDetail;
