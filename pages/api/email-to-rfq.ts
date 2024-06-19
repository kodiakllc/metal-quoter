// /pages/api/rfq-email.ts
import prisma from '@/lib/prisma-client-edge';

export const config = {
  runtime: 'edge',
};

const POST = async (req: Request) => {
  try {
    const { sender, recipient, subject, body, receivedAt, assistantId, assistantThreadId } =
      await req.json();

    // Ensure required fields are present
    if (!sender || !recipient || !body) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Insert the email data into the database using Prisma
    const email = await prisma.email.create({
      data: {
        sender,
        recipient,
        subject,
        body,
        receivedAt: receivedAt || new Date().toISOString(),
      },
    });

    // Trigger background function to process RFQ and generate quote
    fetch(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/process-rfq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailId: email.id,
        assistantId: assistantId,
        assistantThreadId: assistantThreadId,
      }),
    });

    // Return immediate response
    return new Response(JSON.stringify({ message: 'Processing started' }), {
      status: 200,
      statusText: 'OK',
    });
  } catch (error) {
    console.error(error);
    return new Response('Error: ' + error?.toString(), { status: 500, statusText: '' });
  }
};

export default POST;
