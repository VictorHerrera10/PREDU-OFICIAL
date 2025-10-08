'use client';

import { InstitutionsTable } from '@/app/admin/institutions/InstitutionsTable';
import { School } from 'lucide-react';

function AdminInstitutionsPage() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center gap-4">
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
        <InstitutionsTable />
      </div>
    </div>
  );
}

export default AdminInstitutionsPage;
