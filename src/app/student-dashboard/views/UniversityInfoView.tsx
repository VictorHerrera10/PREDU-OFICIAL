'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building } from 'lucide-react';

export default function UniversityInfoView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Building className="text-primary"/>
            Información de Universidades
        </CardTitle>
        <CardDescription>
          Encuentra la institución perfecta para empezar tu futuro profesional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Próximamente: Un buscador de universidades y centros de estudio.
        </p>
      </CardContent>
    </Card>
  );
}
