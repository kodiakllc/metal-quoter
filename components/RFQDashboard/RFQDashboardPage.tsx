// /components/Products/ProductsPage.tsx
import { RFQDTO } from '@/types/dto';
import { ProductDTO } from '@/types/dto/ProductDTO';

import Header from '@/components/Header';
import NavigationMenu from '@/components/NavigationMenu';
import { ThemeProvider } from '@/components/providers';

import RFQDashboard from './RFQDashboard';

interface RFQDashboardPageProps {
  rfqs: RFQDTO[];
}

export function RFQDashboardPage({ rfqs }: RFQDashboardPageProps) {
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
          <RFQDashboard rfqs={rfqs} />
        </div>
      </div>
    </ThemeProvider>
  );
}
