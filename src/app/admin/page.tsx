'use client';

import { Logo } from '@/components/logo';
import { LogoutButton } from '@/components/logout-button';
import { UsersTable } from '@/app/admin/users-table';

function AdminDashboardPage() {
  return (
    <>
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <Logo />
        <div className="flex-1" />
        <LogoutButton />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
            <div>
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                <p className="text-muted-foreground">
                    Aquí puedes ver, agregar, editar y eliminar usuarios de la plataforma.
                </p>
            </div>
        </div>
        <UsersTable />
      </main>
    </>
  );
}

export default AdminDashboardPage;
