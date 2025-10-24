'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { School, Users, UserCheck, TestTube2, ShieldAlert, Megaphone, BrainCircuit } from 'lucide-react';
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
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useEffect, useMemo } from 'react';
import { TutorAdminLoader } from '@/components/tutor-admin-loader';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/admin', label: 'Gestión de Usuarios', icon: Users },
  { href: '/admin/institutions', label: 'Instituciones', icon: School },
  { href: '/admin/independent-tutors', label: 'Tutores Independientes', icon: UserCheck },
  { href: '/admin/forums', label: 'Foros y Avisos', icon: Megaphone },
  { href: '/admin/psychological-test', label: 'Test Psicológico', icon: BrainCircuit },
  { href: '/admin/support', label: 'Soporte Técnico', icon: ShieldAlert },
  { href: '/admin/ml-tests', label: 'Pruebas de ML', icon: TestTube2 },
];

type UserProfile = {
  role?: 'admin' | 'student' | 'tutor';
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || isProfileLoading) {
    return <TutorAdminLoader loadingText="Verificando credenciales de administrador..." />;
  }

  // If user is loaded but doesn't have the admin role
  if (userProfile && userProfile.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-3xl font-bold text-destructive mb-4">Acceso Denegado</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          No tienes los permisos necesarios para acceder a esta página. Esta área es exclusiva para administradores.
        </p>
        <Button asChild onClick={() => router.push('/login')}>
          <Link href="/login">
            Ir a Inicio de Sesión
          </Link>
        </Button>
      </div>
    );
  }

  // If user is an admin, render the layout
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
