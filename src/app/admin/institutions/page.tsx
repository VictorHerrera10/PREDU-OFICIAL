'use client';

import { InstitutionsTable } from '@/app/admin/institutions/InstitutionsTable';
import { School } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';


function AdminInstitutionsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card className="w-full bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
            <School className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">Gestión de Instituciones</h1>
            <p className="text-muted-foreground">
              Administra las instituciones educativas de la plataforma.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <InstitutionsTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminInstitutionsPage;
