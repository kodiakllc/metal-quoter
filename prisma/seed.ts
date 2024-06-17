import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Resetting database...');

  // Dropping all data from tables
  await prisma.quote.deleteMany({});
  await prisma.customProcessingRequest.deleteMany({});
  await prisma.rFQ.deleteMany({});
  await prisma.stockItem.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});

  console.log('Database reset complete. Seeding new data...');

  const customer = await prisma.customer.create({
    data: {
      companyName: 'ACME Metals',
      contactPerson: 'John Doe',
      emailAddress: 'john.doe@acmemetals.com',
      phoneNumber: '555-1234',
      address: '123 Elm Street, Springfield',
    },
  });

  const product = await prisma.product.create({
    data: {
      name: 'Aluminum Coil',
      description: 'High-grade aluminum coil for industrial use',
      category: 'Coil',
    },
  });

  const stockItem = await prisma.stockItem.create({
    data: {
      productId: product.id,
      specification: JSON.stringify({
        alloy: '5052',
        thickness: '0.5mm',
        width: '1500mm',
      }),
      quantityInStock: 100,
      unitPrice: 20.5,
    },
  });

  const rfq = await prisma.rFQ.create({
    data: {
      customerId: customer.id,
      details: JSON.stringify([
        {
          name: 'Aluminum Coil',
          specification: {
            grade: '5052',
            thickness: '0.5mm',
            width: '1500mm',
            length: '2000mm',
          },
          quantity: 20,
        },
      ]),
      deliveryRequirements: 'Deliver to Springfield by 2023-12-25',
      status: 'pending',
      customProcessingRequests: {
        create: [
          {
            processingType: 'Cutting',
            specifications: JSON.stringify({ length: '2000mm' }),
          },
        ],
      },
    },
  });

  const quote = await prisma.quote.create({
    data: {
      rfqId: rfq.id,
      customerId: customer.id,
      totalPrice: 410, // 20 coils at $20.5 each
      deliveryOptions: 'Standard Delivery',
      paymentTerms: '30 days net',
      validityPeriod: new Date('2023-12-31'),
      additionalInformation: 'Price includes cutting to specified lengths.',
      status: 'draft',
    },
  });

  console.log({ customer, product, stockItem, rfq, quote });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
