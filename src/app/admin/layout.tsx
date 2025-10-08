'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { LogoutButton } from '@/components/logout-button';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { School, Users } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Gestión de Usuarios', icon: Users },
  { href: '/admin/institutions', label: 'Instituciones', icon: School },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <Logo />
        <div className="flex-1" />
        <LogoutButton />
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 flex-col border-r bg-background/80 p-4 md:flex">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    asChild
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'justify-start',
                      isActive && 'font-bold text-primary'
                    )}
                  >
                    <span>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
