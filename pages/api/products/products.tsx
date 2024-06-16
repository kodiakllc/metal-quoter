import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Script from 'next/script';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { ProductDTO } from '@/types/dto/ProductDTO';

import { ProductsPage } from '@/components/Products';

import prisma from '@/lib/prisma-client';

interface Props {
  products: ProductDTO[];
}

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
};
export default Products;

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Convert Date objects to ISO strings
  const products = await prisma?.product.findMany();
  const serializedProducts: ProductDTO[] = products.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(), // Serialize date
    updatedAt: product.updatedAt.toISOString(), // Serialize date
  }));
  return {
    props: {
      products: serializedProducts,
      ...(await serverSideTranslations(context.locale ?? 'en', ['common'])),
    },
  };
};
