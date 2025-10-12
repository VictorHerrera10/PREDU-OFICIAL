'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BookOpen } from 'lucide-react';

export default function CareerInfoView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BookOpen className="text-primary"/>
            Información de Carreras
        </CardTitle>
        <CardDescription>
          Explora un universo de profesiones y encuentra la que más te apasione.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-8">
          Próximamente: Un explorador de carreras detallado para ayudarte a tomar la mejor decisión.
        </p>
      </CardContent>
    </Card>
  );
}
