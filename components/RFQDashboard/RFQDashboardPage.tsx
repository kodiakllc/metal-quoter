// /components/Products/ProductsPage.tsx
import { RFQQuote } from '@/types/dto';

import Header from '@/components/Header';
import NavigationMenu from '@/components/NavigationMenu';
import { ThemeProvider } from '@/components/providers';

import RFQDashboard from './RFQDashboard';

interface RFQDashboardPageProps {
  rfqsAndQuotes: RFQQuote[];
}

export function RFQDashboardPage({ rfqsAndQuotes }: RFQDashboardPageProps) {
  // The core layout remains here, with references to the new subcomponents
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <NavigationMenu />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <Header />
          <RFQDashboard rfqsAndQuotes={rfqsAndQuotes} />
        </div>
      </div>
    </ThemeProvider>
  );
}
