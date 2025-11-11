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
import { Progress } from '@/components/ui/progress';
import { TutorValidationForm } from './TutorValidationForm';
import { TutorAcademicValidationForm } from './TutorAcademicValidationForm';
import { TutorPsychologicalValidationForm } from './TutorPsychologicalValidationForm';

type AcademicPrediction = {
    prediction: string;
    grades: Record<string, string>;
};

type PsychologicalPrediction = {
    result?: string;
    answers?: Record<string, 'yes' | 'no'>;
    results?: any; // Define this type more strictly if possible
    progressOverall?: number;
    progressActividades?: number;
    progressHabilidades?: number;
    progressOcupaciones?: number;
};

type StudentProgressCardProps = {
    studentId: string;
    studentName: string;
    studentEmail: string;
};

export function StudentProgressCard({ studentId, studentName, studentEmail }: StudentProgressCardProps) {
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
                                <div className="text-sm text-muted-foreground">Carrera Sugerida: <Badge variant="secondary">{academicPrediction.prediction}</Badge></div>
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
                                <div className="text-sm text-muted-foreground">Perfil RIASEC: <Badge variant="secondary">{psychPrediction.result}</Badge></div>
                            </div>
                        ) : (
                            <div className="space-y-3 text-xs text-left">
                                { psychPrediction ? (
                                <>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-muted-foreground">Actividades</span>
                                            <span className="font-mono text-primary">{Math.round(psychPrediction.progressActividades || 0)}%</span>
                                        </div>
                                        <Progress value={psychPrediction.progressActividades || 0} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-muted-foreground">Habilidades</span>
                                            <span className="font-mono text-primary">{Math.round(psychPrediction.progressHabilidades || 0)}%</span>
                                        </div>
                                        <Progress value={psychPrediction.progressHabilidades || 0} className="h-2" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-muted-foreground">Ocupaciones</span>
                                            <span className="font-mono text-primary">{Math.round(psychPrediction.progressOcupaciones || 0)}%</span>
                                        </div>
                                        <Progress value={psychPrediction.progressOcupaciones || 0} className="h-2" />
                                    </div>
                                </>
                                ) : (
                                    <p className="font-bold text-lg text-amber-400 flex items-center justify-center gap-2"><Clock /> Pendiente</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            {academicPrediction?.grades && <SavedGradesView grades={academicPrediction.grades} />}
            {psychPrediction?.results && questions && <ResultsDisplay answers={psychPrediction.answers || {}} questions={[questions]} />}
            
            <TutorValidationForm 
                studentName={studentName}
                studentEmail={studentEmail}
            />

            <TutorAcademicValidationForm
                studentName={studentName}
                studentEmail={studentEmail}
            />

            <TutorPsychologicalValidationForm
                studentName={studentName}
                studentEmail={studentEmail}
            />
        </div>
    );
}
