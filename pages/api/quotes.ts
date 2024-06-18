// /pages/api/quotes.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma-client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { action, quoteId } = req.body;

    if (!action || !quoteId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    switch (action) {
      case 'approve':
        return changeQuoteStatus(quoteId, 'approved', res);
      case 'unapprove':
        return changeQuoteStatus(quoteId, 'unapproved', res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

const changeQuoteStatus = async (quoteId: number, status: string, res: NextApiResponse) => {
  try {
    // Approve the quote in the database using Prisma
    const quote = await prisma.quote.update({
      where: { id: quoteId },
      data: { status: status },
    });

    // Return a success response
    return res.status(200).json({ message: `Quote status changed to ${status}`, quote });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `Failed to change quote status to ${status}` });
  }
};
