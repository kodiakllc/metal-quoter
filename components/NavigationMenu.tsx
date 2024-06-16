// components/NavigationMenu.js
import {
  Home,
  LineChart,
  Package,
  Package2,
  PanelLeft,
  Settings,
  ShoppingCart,
  Users2,
} from 'lucide-react';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const NavigationMenu = () => {
  // We can add more navigation items here as needed
  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/rfqs', icon: ShoppingCart, label: 'RFQs' },
    { href: '/products', icon: Package, label: 'Products' },
    { href: '/customers', icon: Users2, label: 'Customers' },
    // { href: '#', icon: LineChart, label: 'Analytics' },
    // { href: '#', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">CloudForge Software</span>
        </Link>
        {navItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
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
