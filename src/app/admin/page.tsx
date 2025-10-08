'use client';

import { UsersTable } from '@/app/admin/users-table';
import { Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function AdminDashboardPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      <Card className="w-full bg-card/80 backdrop-blur-sm border-border/50">
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
    </div>
  );
}

export default AdminDashboardPage;
