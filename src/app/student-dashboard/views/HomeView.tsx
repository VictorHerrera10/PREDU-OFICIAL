'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, Lightbulb, Compass, BrainCircuit } from 'lucide-react';
import { getRecommendation } from './recommendation-data';

type AcademicPrediction = {
    prediction: string;
};

type PsychologicalPrediction = {
    result: string;
};

export default function HomeView() {
    const { user } = useUser();
    const firestore = useFirestore();

    const academicDocRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'academic_prediction', user.uid);
    }, [user, firestore]);

    const psychologicalDocRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'psychological_predictions', user.uid);
    }, [user, firestore]);

    const { data: academicPrediction, isLoading: isLoadingAcademic } = useDoc<AcademicPrediction>(academicDocRef);
    const { data: psychologicalPrediction, isLoading: isLoadingPsychological } = useDoc<PsychologicalPrediction>(psychologicalDocRef);

    const isLoading = isLoadingAcademic || isLoadingPsychological;

    const recommendation = useMemo(() => {
        if (!academicPrediction?.prediction || !psychologicalPrediction?.result) {
            return null;
        }
        return getRecommendation(academicPrediction.prediction, psychologicalPrediction.result);
    }, [academicPrediction, psychologicalPrediction]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Analizando tu perfil...</p>
            </div>
        );
    }
    
    const renderWelcomeOrGuidance = () => {
        if (!academicPrediction?.prediction || !psychologicalPrediction?.result) {
            return (
                <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Lightbulb className="text-primary"/> ¡Desbloquea tu Consejo Personalizado!</CardTitle>
                        <CardDescription>
                            Completa ambos tests para recibir una recomendación de carrera a tu medida.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!academicPrediction?.prediction && (
                             <div className="flex items-start gap-4 p-3 border rounded-lg bg-background/50">
                                <Compass className="w-8 h-8 text-amber-400 mt-1"/>
                                <div>
                                    <h4 className="font-semibold text-foreground">Falta el Test Académico</h4>
                                    <p className="text-sm text-muted-foreground">Ve a la sección "Predicción Académica" para ingresar tus notas y descubrir tu área de fortaleza.</p>
                                </div>
                            </div>
                        )}
                         {!psychologicalPrediction?.result && (
                            <div className="flex items-start gap-4 p-3 border rounded-lg bg-background/50">
                                <BrainCircuit className="w-8 h-8 text-purple-400 mt-1"/>
                                 <div>
                                    <h4 className="font-semibold text-foreground">Falta el Test Psicológico</h4>
                                    <p className="text-sm text-muted-foreground">Completa el test de intereses en "Predicción Psicológica" para conocer tu perfil RIASEC.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            );
        }

        if (recommendation) {
            return (
                <Card className="bg-card/80 backdrop-blur-sm border-primary/30">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-primary">Tu Ruta Personalizada hacia el Éxito</CardTitle>
                        <CardDescription>
                            Basado en tus tests, esta es la combinación ideal de tus talentos y pasiones.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 border-l-4 border-amber-400 bg-amber-900/20 rounded-r-lg">
                            <h3 className="font-bold text-amber-300 text-lg mb-2">💡 Consejo de Compatibilidad (Notas + RIASEC)</h3>
                            <p className="text-amber-200">{recommendation.compatibilityAdvice}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="p-4 bg-background/50 rounded-lg">
                                <h3 className="font-bold text-foreground text-lg mb-2">📝 Consejo Académico (Notas)</h3>
                                <p className="text-muted-foreground">{recommendation.academicAdvice}</p>
                            </div>
                             <div className="p-4 bg-background/50 rounded-lg">
                                <h3 className="font-bold text-foreground text-lg mb-2">🧠 Consejo Psicológico (RIASEC)</h3>
                                <p className="text-muted-foreground">{recommendation.psychologicalAdvice}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-background/50 rounded-lg">
                            <h3 className="font-bold text-foreground text-lg mb-2">💼 Oportunidades Profesionales</h3>
                            <p className="text-muted-foreground">{recommendation.opportunities}</p>
                        </div>
                    </CardContent>
                </Card>
            );
        }
        
         return (
             <Card>
                <CardHeader>
                    <CardTitle>Bienvenido a tu Panel</CardTitle>
                    <CardDescription>
                    Aquí verás tus recomendaciones personalizadas una vez completes ambos tests.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <p className="text-muted-foreground">¡Sigue explorando las secciones para descubrir tu potencial!</p>
                </CardContent>
            </Card>
        );
    }

  return (
    <div>
        {renderWelcomeOrGuidance()}
    </div>
  );
}
