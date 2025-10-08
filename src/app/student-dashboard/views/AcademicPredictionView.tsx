'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AcademicPredictionForm } from './AcademicPredictionForm';

export default function AcademicPredictionView() {
  const [predictionResult, setPredictionResult] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predicción Académica</CardTitle>
        <CardDescription>
          {predictionResult ? (
            <span className="text-primary font-bold">{predictionResult}</span>
          ) : (
            'Descubre las carreras que mejor se adaptan a tus habilidades e intereses.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-6">
          Ingresa tus calificaciones en el formulario para iniciar el análisis vocacional basado en tu perfil.
        </p>
        <AcademicPredictionForm setPredictionResult={setPredictionResult} />
      </CardContent>
    </Card>
  );
}
