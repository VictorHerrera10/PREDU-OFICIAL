'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { School, Users, UserCheck, TestTube2 } from 'lucide-react';
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
  SidebarFooter,
} from '@/components/ui/sidebar';
import { AdminUserNav } from '@/components/admin-user-nav';

const navItems = [
  { href: '/admin', label: 'Gestión de Usuarios', icon: Users },
  { href: '/admin/institutions', label: 'Instituciones', icon: School },
  { href: '/admin/independent-tutors', label: 'Tutores Independientes', icon: UserCheck },
  { href: '/admin/ml-tests', label: 'Pruebas de ML', icon: TestTube2 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
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
          <SidebarFooter>
             {/* The UserNav is designed for main headers, not sidebars. We can place a simple one here if needed. */}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="flex items-center justify-between gap-2 border-b p-2">
                 <div className='flex items-center gap-2'>
                    <SidebarTrigger />
                    <h2 className="text-lg font-semibold">Panel de Administración</h2>
                </div>
                <AdminUserNav />
            </header>
            <main>{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
