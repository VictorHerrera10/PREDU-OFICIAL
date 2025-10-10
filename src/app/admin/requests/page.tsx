'use client';

import { TutorRequestsTable } from '@/app/admin/requests/TutorRequestsTable';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Inbox } from 'lucide-react';

function AdminTutorRequestsPage() {
  return (
    <div className="w-full mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
      <Card className="w-full bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="flex flex-row items-center gap-4 pb-4">
          <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
            <Inbox className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">Solicitudes de Tutores Héroe</h1>
            <p className="text-muted-foreground">
              Aprueba o rechaza las solicitudes para crear cuentas de tutor independiente.
            </p>
          </div>
        </CardHeader>
        <CardContent>
            <TutorRequestsTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminTutorRequestsPage;
