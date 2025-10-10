'use client';

import { IndependentTutorsTable } from '@/app/admin/independent-tutors/IndependentTutorsTable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

function AdminIndependentTutorsPage() {
  return (
    <div className="w-full mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
      <Card className="w-full bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
            <UserCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">Gestión de Tutores Independientes</h1>
            <p className="text-muted-foreground">
              Crea y administra grupos para tutores independientes y sus estudiantes.
            </p>
          </div>
        </CardHeader>
        <CardContent>
            <IndependentTutorsTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminIndependentTutorsPage;
