import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'react-query';

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Script from 'next/script';

import { useCreateReducer } from '@/hooks/useCreateReducer';

import { ProductDTO } from '@/types/dto/ProductDTO';

import { MailPage } from '@/components/Dashboard';
import { DashboardOld } from '@/components/Dashboard.old';
import { accounts, mails } from '@/components/Dashboard/data';

// import useErrorService from '@/services/errorService';
// import useApiService from '@/services/useApiService';
import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';

import prisma from '@/lib/prisma-client';

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSideGuestCodeIsSet: boolean;
  products: ProductDTO[];
}

const Home = ({
  serverSideApiKeyIsSet,
  serverSideGuestCodeIsSet,
  products,
}: Props) => {
  const { t } = useTranslation('chat');
  const [initialRender, setInitialRender] = useState<boolean>(true);
  const [whiteLabelTitle, setWhiteLabelTitle] = useState<string | null>(null);

  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: { apiKey, guestCode, lightMode },
    dispatch,
  } = contextValue;

  const defaultLayout = undefined;
  const defaultCollapsed = undefined;

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
      }}
    >
      <Script src="https://www.googletagmanager.com/gtag/js?id=G-4F8XE3JTK6" />
      <Script id="google-analytics">
        {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-4F8XE3JTK6');
          `}
      </Script>
      <Head>
        <title>{whiteLabelTitle ? whiteLabelTitle : 'Metal Quoter'}</title>
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
        className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
      >
        <MailPage products={undefined} />
      </main>
    </HomeContext.Provider>
  );
};
export default Home;

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
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      serverSideGuestCodeIsSet: !!process.env.GUEST_CODES,
      products: serializedProducts,
      ...(await serverSideTranslations(context.locale ?? 'en', ['common'])),
    },
  };
};
