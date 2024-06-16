import { ProductDTO } from '@/types/dto/ProductDTO';

import { Mail } from '@/components/Dashboard/Mail';
import { accounts, mails } from '@/components/Dashboard/data';
import Header from '@/components/Header';
import NavigationMenu from '@/components/NavigationMenu';
import { ThemeProvider } from '@/components/providers';

interface MailPageProps {
  products: ProductDTO[] | undefined;
}

export function MailPage({ products }: MailPageProps) {
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
          <Mail
            accounts={accounts}
            mails={mails}
            defaultLayout={[265, 440, 655]}
            defaultCollapsed={false}
            navCollapsedSize={14}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
