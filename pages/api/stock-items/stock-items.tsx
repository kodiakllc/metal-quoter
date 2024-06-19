// /pages/api/stock-items/stockItems.tsx

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import { toStockItemDTO } from '@/utils/server/product';

import { StockItemDTO } from '@/types/dto/StockItemDTO';

import { StockItemPage } from '@/components/StockItems';

import prisma from '@/lib/prisma-client';
import { StockItem } from '@prisma/client';

interface Props {
  stockItems: StockItemDTO[];
}

/*
const Products = ({ products }: Props) => {
  const { t } = useTranslation('chat');

  const isEnabled = true;

  return (
    <>
      <Head>
        <title>Metal Quoter | Products</title>
        <meta
          name="description"
          content="Metal Quoter is a tool that helps metal service centers generate quotes faster and more accurately."
        />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white dark`}
      >
        <ProductsPage products={products} />
      </main>
    </>
  );
};*/

const StockItems = ({ stockItems }: Props) => {
  const { t } = useTranslation('chat');

  const isEnabled = true;

  return (
    <>
      <Head>
        <title>Metal Quoter | Stock Items</title>
        <meta
          name="description"
          content="Metal Quoter is a tool that helps metal service centers generate quotes faster and more accurately."
        />
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white dark`}
      >
        <StockItemPage stockItems={stockItems} />
      </main>
    </>
  );
};

export default StockItems;

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Convert Date objects to ISO strings
  const stockItems = await prisma?.stockItem.findMany();
  const serializedStockItems = await Promise.all(
    stockItems.map(toStockItemDTO),
  );
  return {
    props: {
      stockItems: serializedStockItems,
      ...(await serverSideTranslations(context.locale ?? 'en', ['common'])),
    },
  };
};
