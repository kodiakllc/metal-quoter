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

  // Create various products
  const products = [
    {
      name: 'Aluminum Rod',
      description: 'High-quality aluminum rods for construction and industrial use',
      category: 'Rod',
    },
    {
      name: 'Stainless Steel Sheet',
      description: 'High-grade stainless steel sheets',
      category: 'Sheet',
    },
    {
      name: 'Copper Tube',
      description: 'Durable copper tubes for plumbing and industrial use',
      category: 'Tube',
    },
    {
      name: 'Carbon Steel Plate',
      description: 'Strong carbon steel plates for construction',
      category: 'Plate',
    },
    {
      name: 'Brass Bar',
      description: 'Versatile brass bars for various industrial applications',
      category: 'Bar',
    },
    {
      name: 'Titanium Sheet',
      description: 'High-strength titanium sheets for aerospace and medical use',
      category: 'Sheet',
    },
    {
      name: 'Nickel Alloy Pipe',
      description: 'Corrosion-resistant nickel alloy pipes',
      category: 'Pipe',
    },
    {
      name: 'Zinc Sheet',
      description: 'Zinc sheets for galvanizing and other applications',
      category: 'Sheet',
    },
    {
      name: 'Magnesium Plate',
      description: 'Lightweight magnesium plates for aerospace applications',
      category: 'Plate',
    },
    {
      name: 'Lead Bar',
      description: 'Lead bars for radiation shielding and other uses',
      category: 'Bar',
    },
  ];

  const createdProducts = await Promise.all(
    products.map((product) => prisma.product.create({ data: product }))
  );

  // Create stock items for each product
  const stockItems = [
    {
      productId: createdProducts[0].id, // Aluminum Rod
      specification: {
        alloyType: '6061',
        diameter: '25mm',
        length: '3000mm',
      },
      quantityInStock: 1000,
      unitPrice: 12.5,
    },
    {
      productId: createdProducts[1].id, // Stainless Steel Sheet
      specification: {
        grade: '304',
        thickness: '0.5mm',
        width: '1000mm',
        length: '2000mm',
      },
      quantityInStock: 1000,
      unitPrice: 30.0,
    },
    {
      productId: createdProducts[2].id, // Copper Tube
      specification: {
        type: 'C110',
        diameter: '15mm',
        length: '6000mm',
      },
      quantityInStock: 300,
      unitPrice: 25.0,
    },
    {
      productId: createdProducts[3].id, // Carbon Steel Plate
      specification: {
        grade: 'A36',
        thickness: '10mm',
        size: '2000mm x 3000mm',
      },
      quantityInStock: 150,
      unitPrice: 50.0,
    },
    {
      productId: createdProducts[4].id, // Brass Bar
      specification: {
        grade: 'C360',
        diameter: '50mm',
        length: '4000mm',
      },
      quantityInStock: 400,
      unitPrice: 40.0,
    },
    {
      productId: createdProducts[5].id, // Titanium Sheet
      specification: {
        grade: 'Grade 2',
        thickness: '1mm',
        width: '1000mm',
        length: '2000mm',
      },
      quantityInStock: 200,
      unitPrice: 150.0,
    },
    {
      productId: createdProducts[6].id, // Nickel Alloy Pipe
      specification: {
        alloy: 'Alloy 400',
        diameter: '100mm',
        length: '5000mm',
      },
      quantityInStock: 250,
      unitPrice: 100.0,
    },
    {
      productId: createdProducts[7].id, // Zinc Sheet
      specification: {
        purity: '99.9%',
        thickness: '0.7mm',
        width: '1200mm',
        length: '2500mm',
      },
      quantityInStock: 350,
      unitPrice: 35.0,
    },
    {
      productId: createdProducts[8].id, // Magnesium Plate
      specification: {
        grade: 'AZ31B',
        thickness: '5mm',
        width: '1500mm',
        length: '3000mm',
      },
      quantityInStock: 100,
      unitPrice: 200.0,
    },
    {
      productId: createdProducts[9].id, // Lead Bar
      specification: {
        purity: '99.9%',
        diameter: '20mm',
        length: '2000mm',
      },
      quantityInStock: 50,
      unitPrice: 60.0,
    },
    // Additional stock items for diversity
    {
      productId: createdProducts[1].id, // Stainless Steel Sheet
      specification: {
        grade: '316',
        thickness: '1mm',
        width: '1500mm',
        length: '3000mm',
      },
      quantityInStock: 400,
      unitPrice: 45.0,
    },
    {
      productId: createdProducts[0].id, // Aluminum Rod
      specification: {
        alloyType: '7075',
        diameter: '30mm',
        length: '6000mm',
      },
      quantityInStock: 600,
      unitPrice: 20.0,
    },
    {
      productId: createdProducts[2].id, // Copper Tube
      specification: {
        type: 'C12200',
        diameter: '20mm',
        wallThickness: '1.5mm',
        length: '5000mm',
      },
      quantityInStock: 450,
      unitPrice: 30.0,
    },
    {
      productId: createdProducts[4].id, // Brass Bar
      specification: {
        grade: 'C260',
        diameter: '40mm',
        length: '5000mm',
      },
      quantityInStock: 500,
      unitPrice: 35.0,
    },
    {
      productId: createdProducts[6].id, // Nickel Alloy Pipe
      specification: {
        alloy: 'Alloy 600',
        diameter: '150mm',
        length: '6000mm',
      },
      quantityInStock: 200,
      unitPrice: 120.0,
    },
    {
      productId: createdProducts[3].id, // Carbon Steel Plate
      specification: {
        grade: 'A572',
        thickness: '8mm',
        size: '1500mm x 3000mm',
      },
      quantityInStock: 250,
      unitPrice: 70.0,
    },
  ];

  const createdStockItems = await Promise.all(
    stockItems.map((stockItem) => prisma.stockItem.create({ data: stockItem }))
  );

  console.log({
    products: createdProducts,
    stockItems: createdStockItems,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
