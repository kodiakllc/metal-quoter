// /utils/server/customer.ts
import prisma from '@/lib/prisma-client-edge';

const findCustomerThreadId = async (customerEmail: string) => {
  const customer = await prisma.customer.findFirst({
    where: { emailAddress: customerEmail },
  });

  return customer?.threadId ?? null;
}

const findCustomerById = async (customerId: number) => {
  return prisma.customer.findFirst({
    where: { id: customerId },
  });
}

const findOrCreateCustomer = async (customerEmail: string, customerName: string, contactPerson: string, phoneNumber: string, address: string) => {
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
  findCustomerById,
  findCustomerThreadId,
  findOrCreateCustomer,
}
