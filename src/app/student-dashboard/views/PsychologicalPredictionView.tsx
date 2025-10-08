'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function PsychologicalPredictionView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Predicción Psicológica</CardTitle>
        <CardDescription>
          Conócete mejor y entiende tus fortalezas personales.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Aquí se mostrarán los tests de personalidad y los análisis psicológicos.
        </p>
      </CardContent>
    </Card>
  );
}
