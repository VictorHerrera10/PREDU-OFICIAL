'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@/firebase';
import api from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { questions, CATEGORY_DETAILS, SECTION_DETAILS, TestSection } from './psychological-test-data';
import { cn } from '@/lib/utils';
import { QuestionModal } from './QuestionModal';

type Answers = Record<string, 'yes' | 'no' | null>;

type Props = {
    setPredictionResult: (result: string | null) => void;
};

export function PsychologicalTest({ setPredictionResult }: Props) {
    const { user } = useUser();
    const { toast } = useToast();
    const [answers, setAnswers] = useState<Answers>(
        questions.reduce((acc, q) => ({ ...acc, [q.id]: null }), {})
    );
    const [activeSection, setActiveSection] = useState<TestSection | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const progress = useMemo(() => {
        const answeredCount = Object.values(answers).filter(a => a !== null).length;
        const totalCount = questions.length;
        const sectionProgress = (section: TestSection) => {
            const sectionQuestions = questions.filter(q => q.section === section);
            const answeredInSection = sectionQuestions.filter(q => answers[q.id] !== null).length;
            if (sectionQuestions.length === 0) return 0;
            return (answeredInSection / sectionQuestions.length) * 100;
        };
        return {
            overall: (answeredCount / totalCount) * 100,
            actividades: sectionProgress('actividades'),
            habilidades: sectionProgress('habilidades'),
            ocupaciones: sectionProgress('ocupaciones'),
        };
    }, [answers]);

    const handleAnswer = (questionId: string, answer: 'yes' | 'no') => {
        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const toggleSection = (section: TestSection) => {
        setActiveSection(prev => (prev === section ? null : section));
    };

    const currentSectionQuestions = useMemo(() => {
        if (!activeSection) return [];
        return questions.filter(q => q.section === activeSection);
    }, [activeSection]);


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
            toast({ title: "¡Análisis Completado! 🧠", description: `Tu perfil sugerido es: ${result}` });
        } catch (error: any) {
            console.error(error);
            toast({ variant: "destructive", title: "Error en el Análisis", description: error.message || "No se pudo conectar con el servicio de predicción." });
        } finally {
            setIsSubmitting(false);
        }
    };
    
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {(Object.keys(SECTION_DETAILS) as TestSection[]).map(sec => (
                        <div key={sec}>
                            <div className="flex justify-between mb-1">
                                <span className="font-medium text-muted-foreground">{SECTION_DETAILS[sec].title}</span>
                                <span className="font-medium text-muted-foreground">{Math.round(progress[sec])}%</span>
                            </div>
                            <Progress value={progress[sec]} className="h-2"/>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                {(Object.keys(SECTION_DETAILS) as TestSection[]).map(sec => {
                    const SectionIcon = SECTION_DETAILS[sec].icon;
                    const isComplete = progress[sec] === 100;
                    return (
                        <div key={sec}>
                            <Button variant="outline" className="h-24 text-lg w-full flex-col gap-2 relative" onClick={() => toggleSection(sec)}>
                                <div className="flex items-center gap-2">
                                    <SectionIcon /> 
                                    <span>{SECTION_DETAILS[sec].title}</span>
                                </div>
                                {isComplete && <CheckCircle className="w-4 h-4 text-green-500 absolute top-2 right-2" />}
                            </Button>

                             <AnimatePresence>
                                {activeSection === sec && (
                                     <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-2"
                                    >
                                        {currentSectionQuestions.map((q, index) => {
                                            const CategoryIcon = CATEGORY_DETAILS[q.category].icon;
                                            const categoryColor = CATEGORY_DETAILS[q.category].color;
                                            const isAnswered = answers[q.id] !== null;

                                            return (
                                                 <QuestionModal
                                                    key={q.id}
                                                    question={q}
                                                    questionNumber={index + 1}
                                                    totalQuestions={currentSectionQuestions.length}
                                                    answer={answers[q.id]}
                                                    onAnswer={handleAnswer}
                                                >
                                                    <button
                                                        className={cn(
                                                            "h-14 w-full border-2 rounded-md flex flex-col items-center justify-center transition-all",
                                                            isAnswered ? 'bg-primary/20 border-primary' : 'bg-muted/50 border-muted-foreground/20 hover:bg-muted'
                                                        )}
                                                        title={q.text}
                                                    >
                                                        <span className={cn("text-lg font-bold", isAnswered ? 'text-primary-foreground' : 'text-muted-foreground')}>{index + 1}</span>
                                                        <CategoryIcon className={cn("w-5 h-5", categoryColor)} />
                                                    </button>
                                                </QuestionModal>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {progress.overall === 100 && (
                <div className="mt-8 text-center">
                    <Button size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                        {isSubmitting ? "Analizando..." : "Finalizar y Obtener Perfil"}
                    </Button>
                </div>
            )}
        </div>
    );
}
