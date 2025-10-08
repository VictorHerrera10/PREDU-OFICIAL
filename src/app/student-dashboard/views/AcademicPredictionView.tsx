'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AcademicPredictionView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Predicción Académica</CardTitle>
        <CardDescription>
          Descubre las carreras que mejor se adaptan a tus habilidades e intereses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Aquí se mostrarán los tests vocacionales y los resultados de predicción académica.
        </p>
      </CardContent>
    </Card>
  );
}
