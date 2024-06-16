import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

import asyncStorage from '@/utils/app/async-storage';

// import { StateProvider } from '@/components/Context/SharedStateContext';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps<{}>) {
  const queryClient = new QueryClient();

  return (
    <>
      {/* <StateProvider> */}
      <div className={inter.className}>
        <ToastContainer
          position="top-center"
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          closeButton={false}
          draggable={false}
          pauseOnHover
          autoClose={1500}
          progressClassName={'Toastify__progress-bar--MetalQuoter'}
          toastClassName={'Toastify__toast--MetalQuoter'}
          bodyClassName={'Toastify__body--MetalQuoter'}
        />
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </div>
      <Analytics />
      {/* </StateProvider> */}
    </>
  );
}

if (typeof window !== 'undefined') {
  window.asyncStorage = asyncStorage;
}

export default appWithTranslation(App);
