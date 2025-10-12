'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Award } from 'lucide-react';

export default function ScholarshipInfoView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Award className="text-primary"/>
            Información de Becas
        </CardTitle>
        <CardDescription>
          Descubre oportunidades de financiamiento que te ayudarán a alcanzar tus metas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Próximamente: Un portal con información sobre becas nacionales e internacionales.
        </p>
      </CardContent>
    </Card>
  );
}
