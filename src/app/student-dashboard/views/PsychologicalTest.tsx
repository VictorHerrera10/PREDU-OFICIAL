'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import api from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { CATEGORY_DETAILS, SECTION_DETAILS, TestSection, HollandQuestion, QuestionCategory } from './psychological-test-data';
import { cn } from '@/lib/utils';
import { QuestionModal } from './QuestionModal';
import { Badge } from '@/components/ui/badge';
import { doc, serverTimestamp, collection, query, orderBy } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ResultsDisplay } from './ResultsDisplay';
import { useNotifications } from '@/hooks/use-notifications';


type Answers = Record<string, 'yes' | 'no' | null>;

type ResultCounts = {
    [key in QuestionCategory]: {
        yes: number;
        no: number;
    };
};

type AllResults = {
    general: ResultCounts;
    actividades: ResultCounts;
    habilidades: ResultCounts;
    ocupaciones: ResultCounts;
}

type PsychologicalPrediction = {
    answers: Answers;
    progressOverall?: number;
    progressActividades?: number;
    progressHabilidades?: number;
    progressOcupaciones?: number;
    result?: string;
    results?: AllResults;
};

type Props = {
    setPredictionResult: (result: string | null) => void;
};

export function PsychologicalTest({ setPredictionResult }: Props) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { addNotification } = useNotifications();
    
    const [answers, setAnswers] = useState<Answers>({});
    const [activeSection, setActiveSection] = useState<TestSection | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<HollandQuestion | null>(null);

    const questionsCollectionRef = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'psychological_questions'), orderBy('section'), orderBy('category'));
    }, [firestore]);

    const { data: questions, isLoading: isLoadingQuestions } = useCollection<HollandQuestion>(questionsCollectionRef);
    
    // Initialize answers state once questions are available
    useEffect(() => {
        if (questions) {
            setAnswers(prevAnswers => {
                const newAnswersState = questions.reduce((acc, q) => ({ ...acc, [q.id]: null }), {});
                // Preserve any saved answers
                return { ...newAnswersState, ...prevAnswers };
            });
        }
    }, [questions]);


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
        if (!questions || questions.length === 0) return { overall: 0, actividades: 0, habilidades: 0, ocupaciones: 0 };
        
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
    }, [questions]);

    const progress = useMemo(() => {
        return calculateProgress(answers);
    }, [answers, calculateProgress]);


    const handleAnswer = (questionId: string, answer: 'yes' | 'no') => {
        if (savedPrediction?.result || !questions) return; // Block answering if result is already saved

        const newAnswers = { ...answers, [questionId]: answer };
        setAnswers(newAnswers);

        if (predictionDocRef) {
            const newProgress = calculateProgress(newAnswers);
            const isComplete = newProgress.overall === 100;

            const dataToSave: Partial<PsychologicalPrediction> & { updatedAt: any, createdAt?: any } = {
                answers: newAnswers,
                progressOverall: newProgress.overall,
                progressActividades: newProgress.actividades,
                progressHabilidades: newProgress.habilidades,
                progressOcupaciones: newProgress.ocupaciones,
                updatedAt: serverTimestamp() as any,
            };
            
            const calculateSectionResults = (section: TestSection | 'all', currentAnswers: Answers): ResultCounts => {
                const initialCounts: ResultCounts = { realista: { yes: 0, no: 0 }, investigador: { yes: 0, no: 0 }, artistico: { yes: 0, no: 0 }, social: { yes: 0, no: 0 }, emprendedor: { yes: 0, no: 0 }, convencional: { yes: 0, no: 0 } };
                if (!questions) return initialCounts;
                const relevantQuestions = section === 'all' ? questions : questions.filter(q => q.section === section);
                return relevantQuestions.reduce((acc, question) => {
                    if (currentAnswers[question.id] === 'yes') acc[question.category].yes++;
                    else if (currentAnswers[question.id] === 'no') acc[question.category].no++;
                    return acc;
                }, initialCounts);
            };

            if (isComplete && !savedPrediction?.results) {
                 dataToSave.results = {
                    general: calculateSectionResults('all', newAnswers),
                    actividades: calculateSectionResults('actividades', newAnswers),
                    habilidades: calculateSectionResults('habilidades', newAnswers),
                    ocupaciones: calculateSectionResults('ocupaciones', newAnswers),
                };
            }

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
            
            if (calculateProgress(newAnswers).overall === 100) {
                 setTimeout(() => {
                    addNotification({
                        type: 'psychological_test_complete',
                        title: '¡Test Psicológico Completo!',
                        description: '¡Genial! Has terminado el test de intereses.',
                        emoji: '🧠'
                    });
                }, 6000);
            }
        }
    };
    
    const handleStartSection = (section: TestSection) => {
        if (savedPrediction?.result) return;
        setActiveSection(section);
    };
    
    const handleOpenQuestion = (question: HollandQuestion) => {
        if (savedPrediction?.result) return;
        setCurrentQuestion(question);
        setIsModalOpen(true);
    };

    const handleNavigate = (direction: 'next' | 'prev') => {
        if (!currentQuestion || !activeSection || !questions) return;

        const sectionQuestions = questions.filter(q => q.section === activeSection);
        const currentIndex = sectionQuestions.findIndex(q => q.id === currentQuestion.id);

        if (direction === 'next' && currentIndex < sectionQuestions.length - 1) {
            setCurrentQuestion(sectionQuestions[currentIndex + 1]);
        } else if (direction === 'prev' && currentIndex > 0) {
            setCurrentQuestion(sectionQuestions[currentIndex - 1]);
        }
    };

    const handleSubmit = async () => {
        if (!user || !questions) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las preguntas o el usuario.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const scores = (Object.keys(CATEGORY_DETAILS) as QuestionCategory[]).reduce((acc, category) => {
                acc[category] = 0;
                return acc;
            }, {} as Record<QuestionCategory, number>);

            for (const [questionId, answer] of Object.entries(answers)) {
                if (answer === 'yes') {
                    const question = questions.find(q => q.id === questionId);
                    if (question) {
                        scores[question.category]++;
                    }
                }
            }
            
            const response = await api.post('/prediccion/psicologica/', scores);
            const result = Object.values(response.data)[0] as string || "No se pudo determinar el perfil.";
            setPredictionResult(result);
            
            if (predictionDocRef) {
                setDocumentNonBlocking(predictionDocRef, { result, updatedAt: serverTimestamp() }, { merge: true });
            }
            
            toast({ title: "¡Análisis Completado! 🧠", description: `Tu perfil sugerido es: ${result}` });
        } catch (error: any) {
            console.error("Error al contactar la API de predicción:", error);

            if (error.response) {
                toast({
                    variant: "destructive",
                    title: "Error en el Análisis",
                    description: error.response.data?.detail || "Hubo un problema al procesar tus respuestas.",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "Servicio no Disponible",
                    description: "El servicio de predicción parece tener dificultades. Por favor, intenta de nuevo más tarde o regresa al inicio. 🛠️",
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const activeSectionDetails = activeSection ? SECTION_DETAILS[activeSection as TestSection] : null;
    const ActiveSectionIcon = activeSectionDetails ? activeSectionDetails.icon : null;
    const activeSectionProgress = activeSection ? progress[activeSection] : 0;
    const isTestLocked = !!savedPrediction?.result;


    if (isLoadingPrediction || isLoadingQuestions) {
        return (
            <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Cargando test...</p>
            </div>
        );
    }
    
    if (!questions || questions.length === 0) {
        return (
             <div className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No hay preguntas configuradas para este test.</p>
            </div>
        )
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
                 {isTestLocked && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center gap-2 text-sm text-amber-400 bg-amber-900/30 border border-amber-500/50 rounded-lg p-2"
                    >
                        <Lock className="w-4 h-4" />
                        <span>El test está finalizado y bloqueado.</span>
                    </motion.div>
                )}
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
                                        disabled={isTestLocked}
                                        className="p-4 border-2 rounded-lg flex flex-col items-center justify-center gap-2 text-center transition-all bg-card/80 backdrop-blur-sm hover:border-primary/50 hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:border-current disabled:hover:-translate-y-0"
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
                                <ResultsDisplay answers={answers} questions={questions} />
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
                                    const isAnswered = answers[q.id] !== null;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleOpenQuestion(q)}
                                            disabled={isTestLocked}
                                            className={cn(
                                                "h-14 w-full border-2 rounded-md flex flex-col items-center justify-center transition-all disabled:opacity-60 disabled:cursor-not-allowed",
                                                !isAnswered && 'hover:border-primary/50'
                                            )}
                                            style={isAnswered ? { 
                                                borderColor: categoryInfo.color,
                                                backgroundColor: `color-mix(in srgb, ${categoryInfo.color} 15%, transparent)`,
                                            } : {}}
                                            title={q.text}
                                        >
                                            <span className={cn("text-lg font-bold", isAnswered ? 'text-foreground/80' : 'text-muted-foreground')}>{index + 1}</span>
                                            <CategoryIcon className="w-5 h-5" style={isAnswered ? {color: categoryInfo.color} : {}}/>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {isModalOpen && currentQuestion && activeSection && questions && (
                     <QuestionModal
                        key={currentQuestion.id}
                        question={currentQuestion}
                        allQuestions={questions.filter(q => q.section === activeSection)}
                        answer={answers[currentQuestion.id]}
                        onAnswer={handleAnswer}
                        onNavigate={handleNavigate}
                        isOpen={isModalOpen}
                        setIsOpen={setIsModalOpen}
                        isLocked={isTestLocked}
                    />
            )}
        </div>
    );
}

    