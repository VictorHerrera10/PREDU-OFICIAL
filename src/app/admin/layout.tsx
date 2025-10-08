'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { LogoutButton } from '@/components/logout-button';
import { School, Users } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';

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
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin');
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                      <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarHeader>
             <LogoutButton />
          </SidebarHeader>
        </Sidebar>
        <SidebarInset>
            <header className="flex items-center gap-2 border-b p-2">
                <SidebarTrigger />
                <h2 className="text-lg font-semibold">Panel de Administración</h2>
            </header>
            <main className="flex-1 md:pl-5">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
