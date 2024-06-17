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

  // Create various products
  const products = [
    {
      name: 'Aluminum Coil',
      description: 'High-grade aluminum coil for industrial use',
      category: 'Coil',
    },
    {
      name: 'Stainless Steel Tube',
      description: 'Durable stainless steel tubes',
      category: 'Tube',
    },
    {
      name: 'Copper Sheet',
      description: 'High-quality copper sheets for electrical applications',
      category: 'Sheet',
    },
    {
      name: 'Carbon Steel Plate',
      description: 'Strong carbon steel plates for construction',
      category: 'Plate',
    },
  ];

  const createdProducts = await Promise.all(
    products.map((product) => prisma.product.create({ data: product }))
  );

  // Create stock items for each product
  const stockItems = [
    {
      productId: createdProducts[0].id,
      specification: {
        alloy: '5052',
        thickness: '0.5mm',
        width: '1500mm',
      },
      quantityInStock: 100,
      unitPrice: 20.5,
    },
    {
      productId: createdProducts[1].id,
      specification: {
        grade: '304',
        diameter: '25mm',
        wallThickness: '1mm',
      },
      quantityInStock: 200,
      unitPrice: 15.0,
    },
    {
      productId: createdProducts[2].id,
      specification: {
        type: 'C110',
        thickness: '0.5mm',
        size: '1000mm x 2000mm',
      },
      quantityInStock: 150,
      unitPrice: 10.0,
    },
    {
      productId: createdProducts[3].id,
      specification: {
        grade: 'A36',
        thickness: '10mm',
        size: '2000mm x 3000mm',
      },
      quantityInStock: 50,
      unitPrice: 50.0,
    },
    {
      productId: createdProducts[3].id,
      specification: {
        grade: 'A516',
        thickness: '20mm',
        size: '2500mm x 6000mm',
      },
      quantityInStock: 30,
      unitPrice: 75.0,
    },
    {
      productId: createdProducts[1].id,
      specification: {
        grade: '316',
        diameter: '50mm',
        wallThickness: '2mm',
      },
      quantityInStock: 80,
      unitPrice: 25.0,
    },
  ];

  const createdStockItems = await Promise.all(
    stockItems.map((stockItem) => prisma.stockItem.create({ data: stockItem }))
  );

  const rfq = await prisma.rFQ.create({
    data: {
      customerId: customer.id,
      details: [
        {
          name: 'Aluminum Coil',
          specification: {
            alloy: '5052',
            thickness: '0.5mm',
            width: '1500mm',
            length: '2000mm',
          },
          quantity: 20,
        },
      ],
      deliveryRequirements: 'Deliver to Springfield by 2023-12-25',
      status: 'pending',
      customProcessingRequests: {
        create: [
          {
            processingType: 'Cutting',
            specifications: { length: '2000mm' },
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

  console.log({ customer, products: createdProducts, stockItems: createdStockItems, rfq, quote });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
