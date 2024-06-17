// /utils/server/customer.ts
import prisma from '@/lib/prisma-client-edge';

const findCustomerThreadId = async (customerEmail: string) => {
  const customer = await prisma.customer.findFirst({
    where: { emailAddress: customerEmail },
  });

  return customer?.threadId ?? null;
}

const findOrCreateCustomer = (customerEmail: string, customerName: string, contactPerson: string, phoneNumber: string, address: string) => {
  return prisma.customer.upsert({
    where: { emailAddress: customerEmail },
    update: {},
    create: {
      companyName: customerName,
      contactPerson,
      emailAddress: customerEmail,
      phoneNumber,
      address,
    },
  });
}

export {
  findCustomerThreadId,
  findOrCreateCustomer,
}
