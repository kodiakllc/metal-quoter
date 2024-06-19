// /pages/api/home/home.tsx
import { useEffect, useRef, useState } from 'react';

import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Script from 'next/script';



import { useCreateReducer } from '@/hooks/useCreateReducer';

import { toQuoteDTO, toRFQAndQuoteDTOs } from '@/utils/server/quote';
import { toRFQDTO } from '@/utils/server/rfq';

import { RFQDTO, RFQQuote } from '@/types/dto';
import { ProductDTO } from '@/types/dto/ProductDTO';

// import { MailPage } from '@/components/Dashboard';
import { RFQDashboardPage } from '@/components/RFQDashboard';

// import { accounts, mails } from '@/components/Dashboard/data';
// import useErrorService from '@/services/errorService';
// import useApiService from '@/services/useApiService';
import HomeContext from './home.context';
import { HomeInitialState, initialState } from './home.state';

import prisma from '@/lib/prisma-client';

interface Props {
  rfqsAndQuotes: RFQQuote[];
}

const Home = ({ rfqsAndQuotes }: Props) => {
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
        <RFQDashboardPage rfqsAndQuotes={rfqsAndQuotes} />
      </main>
    </HomeContext.Provider>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Convert Date objects to ISO strings
  const rfqs = await prisma.rFQ.findMany({
    include: {
      quotes: true,
      customer: true,
      customProcessingRequests: true,
    },
  });

  // convert RFQs to RFQQuote
  const rfqsAndQuotes = rfqs.length > 0 ? await toRFQAndQuoteDTOs(rfqs) : [];

  return {
    props: {
      rfqsAndQuotes: rfqsAndQuotes,
      ...(await serverSideTranslations(context.locale as string, [
        'common',
        'chat',
      ])),
    },
  };
};
