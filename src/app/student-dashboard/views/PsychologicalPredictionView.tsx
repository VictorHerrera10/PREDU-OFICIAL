'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PsychologicalPredictionForm } from './PsychologicalPredictionForm';

export default function PsychologicalPredictionView() {
  const [predictionResult, setPredictionResult] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predicción Psicológica</CardTitle>
        <CardDescription>
           {predictionResult ? (
            <span className="text-primary font-bold">{predictionResult}</span>
          ) : (
            'Conócete mejor y entiende tus fortalezas personales.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-6">
          Responde a las siguientes preguntas para recibir un análisis de tu perfil de personalidad y su relación con distintas áreas profesionales.
        </p>
        <PsychologicalPredictionForm setPredictionResult={setPredictionResult} />
      </CardContent>
    </Card>
  );
}
