'use client';

import { useMemo } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Compass, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ResultsDisplay } from '@/app/student-dashboard/views/ResultsDisplay';
import { SavedGradesView } from '@/app/student-dashboard/views/SavedGradesView';
import { HollandQuestion } from '@/app/student-dashboard/views/psychological-test-data';

type AcademicPrediction = {
    prediction: string;
    grades: Record<string, string>;
};

type PsychologicalPrediction = {
    result?: string;
    answers?: Record<string, 'yes' | 'no'>;
    results?: any; // Define this type more strictly if possible
};

type StudentProgressCardProps = {
    studentId: string;
    studentName: string;
};

export function StudentProgressCard({ studentId, studentName }: StudentProgressCardProps) {
    const firestore = useFirestore();

    const academicRef = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'academic_prediction', studentId);
    }, [firestore, studentId]);

    const psychRef = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'psychological_predictions', studentId);
    }, [firestore, studentId]);

    // Dummy query, not used for data but needed for ResultsDisplay
    const questionsQuery = useMemo(() => {
        if (!firestore) return null;
        return doc(firestore, 'psychological_questions', 'dummy'); // This won't fetch real data
    }, [firestore]);


    const { data: academicPrediction, isLoading: isLoadingAcademic } = useDoc<AcademicPrediction>(academicRef);
    const { data: psychPrediction, isLoading: isLoadingPsych } = useDoc<PsychologicalPrediction>(psychRef);
    const { data: questions } = useDoc<HollandQuestion>(questionsQuery);


    const isLoading = isLoadingAcademic || isLoadingPsych;

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={cn(academicPrediction ? "bg-green-900/20 border-green-500/30" : "bg-muted/50")}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Compass className="h-5 w-5"/>
                            Test Académico
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        {academicPrediction ? (
                            <div className="space-y-2">
                                <p className="font-bold text-lg text-green-400 flex items-center justify-center gap-2"><CheckCircle /> Completado</p>
                                <p>Carrera Sugerida: <Badge variant="secondary">{academicPrediction.prediction}</Badge></p>
                            </div>
                        ) : (
                            <p className="font-bold text-lg text-amber-400 flex items-center justify-center gap-2"><Clock /> Pendiente</p>
                        )}
                    </CardContent>
                </Card>
                <Card className={cn(psychPrediction?.result ? "bg-green-900/20 border-green-500/30" : "bg-muted/50")}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BrainCircuit className="h-5 w-5"/>
                            Test Psicológico
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        {psychPrediction?.result ? (
                             <div className="space-y-2">
                                <p className="font-bold text-lg text-green-400 flex items-center justify-center gap-2"><CheckCircle /> Completado</p>
                                <p>Perfil RIASEC: <Badge variant="secondary">{psychPrediction.result}</Badge></p>
                            </div>
                        ) : (
                            <p className="font-bold text-lg text-amber-400 flex items-center justify-center gap-2"><Clock /> {psychPrediction?.progressOverall ? `En Progreso (${Math.round(psychPrediction.progressOverall)}%)` : 'Pendiente'}</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            {academicPrediction?.grades && <SavedGradesView grades={academicPrediction.grades} />}
            {psychPrediction?.results && questions && <ResultsDisplay answers={psychPrediction.answers || {}} questions={[questions]} />}
        </div>
    );
}