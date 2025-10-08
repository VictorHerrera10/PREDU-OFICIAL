'use client';

import { Logo } from '@/components/logo';
import { LogoutButton } from '@/components/logout-button';
import { UsersTable } from '@/app/admin/users-table';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function AdminDashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <Logo />
        <div className="flex-1" />
        <LogoutButton />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                 <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                    <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-primary">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground">
                    Aquí puedes ver, agregar, editar y eliminar usuarios de la plataforma.
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <UsersTable />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
