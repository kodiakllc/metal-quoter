// /components/NavigationMenu.tsx
import { Cloud, Home, Package, Puzzle, Quote } from 'lucide-react';

import Link from 'next/link';
import { useRouter } from 'next/router';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const NavigationMenu = () => {
  const router = useRouter(); // Use the useRouter hook to get the current route

  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/rfqs', icon: Quote, label: 'RFQs' },
    { href: '/products', icon: Package, label: 'Products' },
    { href: '/stock-items', icon: Puzzle, label: 'Stock Items' },
    // ... (any other nav items)
  ];

  // Function to determine if the item is the currently selected one based on the route
  const isActive = (href: string) => router.pathname === href;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="/"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Cloud className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">CloudForge Software</span>
        </Link>
        {navItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Link href={item.href} passHref legacyBehavior>
                <a
                  className={`flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 ${
                    isActive(item.href)
                      ? 'bg-accent text-accent-foreground'
                      : ''
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </a>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </nav>
    </aside>
  );
};

export default NavigationMenu;
