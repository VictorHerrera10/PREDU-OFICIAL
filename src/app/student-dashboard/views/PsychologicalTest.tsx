'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import api from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { questions, CATEGORY_DETAILS, SECTION_DETAILS, TestSection, HollandQuestion } from './psychological-test-data';
import { cn } from '@/lib/utils';
import { QuestionModal } from './QuestionModal';
import { Badge } from '@/components/ui/badge';
import { doc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ResultsDisplay } from './ResultsDisplay';


type Answers = Record<string, 'yes' | 'no' | null>;

type PsychologicalPrediction = {
    answers: Answers;
    progressOverall?: number;
    progressActividades?: number;
    progressHabilidades?: number;
    progressOcupaciones?: number;
    result?: string;
};

type Props = {
    setPredictionResult: (result: string | null) => void;
};

export function PsychologicalTest({ setPredictionResult }: Props) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [answers, setAnswers] = useState<Answers>(() =>
        questions.reduce((acc, q) => ({ ...acc, [q.id]: null }), {})
    );
    const [activeSection, setActiveSection] = useState<TestSection | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<HollandQuestion | null>(null);

    const predictionDocRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'psychological_predictions', user.uid);
    }, [user, firestore]);

    const { data: savedPrediction, isLoading: isLoadingPrediction } = useDoc<PsychologicalPrediction>(predictionDocRef);

    useEffect(() => {
        if (savedPrediction) {
            if (savedPrediction.answers) {
                setAnswers(prev => ({ ...prev, ...savedPrediction.answers }));
            }
            if (savedPrediction.result) {
                setPredictionResult(savedPrediction.result);
            }
        }
    }, [savedPrediction, setPredictionResult]);

    const calculateProgress = useCallback((currentAnswers: Answers) => {
        const answeredCount = Object.values(currentAnswers).filter(a => a !== null).length;
        const totalCount = questions.length;
        
        const sectionProgress = (section: TestSection) => {
            const sectionQuestions = questions.filter(q => q.section === section);
            const answeredInSection = sectionQuestions.filter(q => currentAnswers[q.id] !== null).length;
            if (sectionQuestions.length === 0) return 0;
            return (answeredInSection / sectionQuestions.length) * 100;
        };

        return {
            overall: (answeredCount / totalCount) * 100,
            actividades: sectionProgress('actividades'),
            habilidades: sectionProgress('habilidades'),
            ocupaciones: sectionProgress('ocupaciones'),
        };
    }, []);

    const progress = useMemo(() => {
        if (savedPrediction?.progressOverall !== undefined) {
             const progressData = {
                overall: savedPrediction.progressOverall ?? 0,
                actividades: savedPrediction.progressActividades ?? 0,
                habilidades: savedPrediction.progressHabilidades ?? 0,
                ocupaciones: savedPrediction.progressOcupaciones ?? 0,
            };
            // Ensure we use the live calculation if the saved data is somehow stale
             const calculatedProgress = calculateProgress(answers);
             if (Math.round(progressData.overall) !== Math.round(calculatedProgress.overall)) {
                 return calculatedProgress;
             }
            return progressData;
        }
        return calculateProgress(answers);
    }, [answers, savedPrediction, calculateProgress]);


    const handleAnswer = (questionId: string, answer: 'yes' | 'no') => {
        const newAnswers = { ...answers, [questionId]: answer };
        setAnswers(newAnswers);

        if (predictionDocRef) {
            const newProgress = calculateProgress(newAnswers);
            const dataToSave: Partial<PsychologicalPrediction> = {
                answers: newAnswers,
                progressOverall: newProgress.overall,
                progressActividades: newProgress.actividades,
                progressHabilidades: newProgress.habilidades,
                progressOcupaciones: newProgress.ocupaciones,
                updatedAt: serverTimestamp() as any,
            };
            // Create a new document if it does not exist
            if (!savedPrediction) {
                dataToSave.createdAt = serverTimestamp() as any;
            }
            setDocumentNonBlocking(predictionDocRef, dataToSave, { merge: true });
        }

        if (!activeSection) return;

        const sectionQuestions = questions.filter(q => q.section === activeSection);
        const currentIndex = sectionQuestions.findIndex(q => q.id === questionId);
        
        if (currentIndex !== -1 && currentIndex < sectionQuestions.length - 1) {
            setCurrentQuestion(sectionQuestions[currentIndex + 1]);
        } else {
            setIsModalOpen(false);
            setCurrentQuestion(null);
        }
    };
    
    const handleStartSection = (section: TestSection) => {
        setActiveSection(section);
    };
    
    const handleOpenQuestion = (question: HollandQuestion) => {
        setCurrentQuestion(question);
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const scores = Object.entries(answers).reduce((acc, [questionId, answer]) => {
                if (answer === 'yes') {
                    const question = questions.find(q => q.id === questionId);
                    if (question) {
                        acc[question.category] = (acc[question.category] || 0) + 1;
                    }
                }
                return acc;
            }, {} as Record<string, number>);

            const requestData = { user_id: user.uid, ...scores };
            const response = await api.post('/prediccion/psicologica/', requestData);
            const result = Object.values(response.data)[0] as string || "No se pudo determinar el perfil.";
            setPredictionResult(result);
            
            if (predictionDocRef) {
                setDocumentNonBlocking(predictionDocRef, { result, updatedAt: serverTimestamp() }, { merge: true });
            }
            
            toast({ title: "¡Análisis Completado! 🧠", description: `Tu perfil sugerido es: ${result}` });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Error en el Análisis", description: error.message || "No se pudo conectar con el servicio de predicción." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const activeSectionDetails = activeSection ? SECTION_DETAILS[activeSection as TestSection] : null;
    const ActiveSectionIcon = activeSectionDetails ? activeSectionDetails.icon : null;
    const activeSectionProgress = activeSection ? progress[activeSection] : 0;

    const colorClasses = {
        green: { border: 'border-green-400', bg: 'bg-green-900/50', hover: 'hover:border-green-300' },
        blue: { border: 'border-blue-400', bg: 'bg-blue-900/50', hover: 'hover:border-blue-300' },
        purple: { border: 'border-purple-400', bg: 'bg-purple-900/50', hover: 'hover:border-purple-300' },
        pink: { border: 'border-pink-400', bg: 'bg-pink-900/50', hover: 'hover:border-pink-300' },
        amber: { border: 'border-amber-400', bg: 'bg-amber-900/50', hover: 'hover:border-amber-300' },
        teal: { border: 'border-teal-400', bg: 'bg-teal-900/50', hover: 'hover:border-teal-300' },
    };

    if (isLoadingPrediction) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Recuperando tu progreso...</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="space-y-4 mb-8">
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-primary">Progreso General</span>
                        <span className="text-sm font-medium text-primary">{Math.round(progress.overall)}%</span>
                    </div>
                    <Progress value={progress.overall} />
                </div>
            </div>
            
            <AnimatePresence mode="wait">
                {!activeSection ? (
                    <motion.div
                        key="sections"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(Object.keys(SECTION_DETAILS) as TestSection[]).map(sec => {
                                const SectionIcon = SECTION_DETAILS[sec].icon;
                                const isComplete = progress[sec] === 100;
                                return (
                                    <button
                                        key={sec}
                                        onClick={() => handleStartSection(sec)}
                                        className="p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 text-center transition-all bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:-translate-y-1"
                                    >
                                        <div className="flex items-center gap-2">
                                            <SectionIcon className="w-8 h-8 text-primary" />
                                            {isComplete && <CheckCircle className="w-5 h-5 text-green-500" />}
                                        </div>
                                        <h3 className="text-lg font-semibold text-foreground">{SECTION_DETAILS[sec].title}</h3>
                                        <p className="text-muted-foreground text-sm">{SECTION_DETAILS[sec].description}</p>
                                        <Progress value={progress[sec]} className="h-2 w-full mt-2"/>
                                    </button>
                                );
                            })}
                        </div>
                         {progress.overall === 100 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="mt-12"
                            >
                                <ResultsDisplay answers={answers} />
                            </motion.div>
                        )}

                        {progress.overall === 100 && !savedPrediction?.result && (
                            <div className="mt-8 text-center">
                                <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                                    {isSubmitting ? "Analizando..." : "Finalizar y Obtener Perfil"}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="questions"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button onClick={() => setActiveSection(null)} variant="ghost" className="mb-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver a las Secciones
                        </Button>
                        
                        <div key={activeSection}>
                             <div className="flex flex-col items-center justify-center gap-2 mb-4">
                                <div className="flex items-center gap-3">
                                    {ActiveSectionIcon && <ActiveSectionIcon className="w-8 h-8 text-primary" />}
                                    <h3 className="text-2xl font-semibold text-foreground">{activeSectionDetails?.title}</h3>
                                    <Badge variant={activeSectionProgress === 100 ? "default" : "secondary"}>
                                        {Math.round(activeSectionProgress)}%
                                    </Badge>
                                </div>
                                {activeSectionProgress === 100 && <CheckCircle className="w-5 h-5 text-green-500" />}
                            </div>

                            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-12 gap-2">
                                {questions.filter(q => q.section === activeSection).map((q, index) => {
                                    const categoryInfo = CATEGORY_DETAILS[q.category];
                                    const CategoryIcon = categoryInfo.icon;
                                    const colorClass = categoryInfo.colorClass as keyof typeof colorClasses;
                                    const colors = colorClasses[colorClass];
                                    const isAnswered = answers[q.id] !== null;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleOpenQuestion(q)}
                                            className={cn(
                                                "h-14 w-full border-2 rounded-md flex flex-col items-center justify-center transition-all",
                                                isAnswered 
                                                    ? `${colors.bg} ${colors.border}`
                                                    : `bg-muted/50 ${colors.border} ${colors.hover}`
                                            )}
                                            title={q.text}
                                        >
                                            <span className={cn("text-lg font-bold", isAnswered ? 'text-foreground/80' : 'text-muted-foreground')}>{index + 1}</span>
                                            <CategoryIcon className={cn("w-5 h-5", categoryInfo.color)} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {isModalOpen && currentQuestion && activeSection && (
                     <QuestionModal
                        key={currentQuestion.id}
                        question={currentQuestion}
                        allQuestions={questions.filter(q => q.section === activeSection)}
                        answer={answers[currentQuestion.id]}
                        onAnswer={handleAnswer}
                        isOpen={isModalOpen}
                        setIsOpen={setIsModalOpen}
                    />
            )}
        </div>
    );
}
