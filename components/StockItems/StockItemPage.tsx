// /components/StockItems/StockItemPage.tsx
import { StockItemDTO } from '@/types/dto/StockItemDTO';
import Header from '@/components/Header';
import NavigationMenu from '@/components/NavigationMenu';
import { ThemeProvider } from '@/components/providers';
import StockItemTable from './StockItemTable';

interface StockItemPageProps {
  stockItems: StockItemDTO[];
}

export function StockItemPage({ stockItems }: StockItemPageProps) {
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
          <StockItemTable stockItems={stockItems} />
        </div>
      </div>
    </ThemeProvider>
  );
}