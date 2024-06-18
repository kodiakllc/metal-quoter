// /pages/api/quotes.ts
import prisma from '@/lib/prisma-client-edge';

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request) => {
  try {
    const { method } = req;

    switch (method) {
      case 'POST':
        return handlePost(req);
      // Additional cases for other methods (GET, PUT, DELETE) can be added here
      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }
  } catch (error) {
    console.error(error);
    return new Response('Error: ' + error?.toString(), { status: 500, statusText: '' });
  }
};

const handlePost = async (req: Request) => {
  const { action, quoteId } = await req.json();

  if (!action || !quoteId) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
  }

  switch (action) {
    case 'approve':
      return changeQuoteStatus(quoteId, 'approved');
    case 'unapprove':
      return changeQuoteStatus(quoteId, 'draft');
    default:
      return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
  }
};

const changeQuoteStatus = async (quoteId: number, status: string) => {
  try {
    // Approve the quote in the database using Prisma
    const quote = await prisma.quote.update({
      where: { id: quoteId },
      data: { status: status },
    });

    // Return a success response
    return new Response(JSON.stringify({ message: 'Quote status changed', quote }), {
      status: 200,
      statusText: 'OK',
    });
  } catch (error) {
    console.error(error);
    return new Response('Error: ' + error?.toString(), { status: 500, statusText: '' });
  }
};

export default handler;
