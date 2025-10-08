'use client';

import { InstitutionsTable } from '@/app/admin/institutions/InstitutionsTable';
import { School } from 'lucide-react';

function AdminInstitutionsPage() {
  return (
    <div className="w-full">
      <div className="flex items-center gap-4 p-4 md:p-8">
        <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
          <School className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-primary">Gestión de Instituciones</h1>
          <p className="text-muted-foreground">
            Administra las instituciones educativas de la plataforma.
          </p>
        </div>
      </div>
      <div className="p-4 md:p-8 pt-0">
        <InstitutionsTable />
      </div>
    </div>
  );
}

export default AdminInstitutionsPage;
