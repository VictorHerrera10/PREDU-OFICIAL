'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { VocationalFormModal } from './AcademicPredictionForm';
import { Loader2, Lock } from 'lucide-react';
import { SavedGradesView } from './SavedGradesView';
import { motion } from 'framer-motion';

type AcademicPrediction = {
    prediction: string;
    grades: Record<string, string>;
};

export default function AcademicPredictionView() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [localPrediction, setLocalPrediction] = useState<string | null>(null);

  const predictionDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'academic_prediction', user.uid);
  }, [user, firestore]);

  const { data: savedPrediction, isLoading: isLoadingPrediction } = useDoc<AcademicPrediction>(predictionDocRef);

  const finalPrediction = localPrediction || savedPrediction?.prediction;

  if (isLoadingPrediction) {
    return (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Cargando tu predicción académica...</p>
        </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Predicción Académica</CardTitle>
        <CardDescription>
          {finalPrediction ? (
            <>
                Tu carrera recomendada es: <span className="text-primary font-bold">{finalPrediction}</span>
            </>
          ) : (
            'Descubre las carreras que mejor se adaptan a tus habilidades e intereses.'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
         {finalPrediction && savedPrediction?.grades ? (
            <div className="space-y-4">
                 <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 text-sm text-amber-400 bg-amber-900/30 border border-amber-500/50 rounded-lg p-2 mb-6"
                >
                    <Lock className="w-4 h-4" />
                    <span>El test está finalizado y bloqueado.</span>
                </motion.div>
                <SavedGradesView grades={savedPrediction.grades} />
            </div>
        ) : (
            <>
                <p className="text-muted-foreground mb-6">
                Ingresa tus calificaciones en el formulario para iniciar el análisis vocacional basado en tu perfil.
                </p>
                <VocationalFormModal setPredictionResult={setLocalPrediction} />
            </>
        )}
      </CardContent>
    </Card>
  );
}
