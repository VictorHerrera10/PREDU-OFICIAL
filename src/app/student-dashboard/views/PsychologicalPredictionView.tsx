'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PsychologicalTest } from './PsychologicalTest';

export default function PsychologicalPredictionView() {
  const [predictionResult, setPredictionResult] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test de Intereses Vocacionales (RIASEC)</CardTitle>
        <CardDescription>
           {predictionResult ? (
            <>
              Tu perfil dominante es: <span className="text-primary font-bold">{predictionResult}</span>
            </>
          ) : (
            'Descubre tu perfil de intereses y las carreras asociadas a él.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PsychologicalTest setPredictionResult={setPredictionResult} />
      </CardContent>
    </Card>
  );
}
