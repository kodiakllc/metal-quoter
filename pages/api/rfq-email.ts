// pages/api/rfq-email.ts
import prisma from "@/lib/prisma-client-edge";

export const config = {
  runtime: 'edge',
};

const handler = async (req: Request) => {
  try {
    const { sender, recipient, subject, body, receivedAt } = await req.json();

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
        receivedAt: receivedAt || new Date().toISOString(), // Use provided receivedAt or current timestamp
        // Assuming proccesingStatus defaults to "pending" as per your model, so no need to set it explicitly here
      },
    });

    return new Response(JSON.stringify(email), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Error: ' + error?.toString(), { status: 500, statusText: '' });
  }
};

export default handler;
