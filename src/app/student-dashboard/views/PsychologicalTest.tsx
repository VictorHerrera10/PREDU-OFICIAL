'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@/firebase';
import api from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';
import { questions, CATEGORY_DETAILS, SECTION_DETAILS, TestSection, HollandQuestion } from './psychological-test-data';
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
    
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<HollandQuestion | null>(null);

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

        // Auto-advance logic
        const sectionQuestions = questions.filter(q => q.section === activeSection);
        const currentIndex = sectionQuestions.findIndex(q => q.id === questionId);
        
        if (currentIndex !== -1 && currentIndex < sectionQuestions.length - 1) {
            // If there's a next question in the section, show it
            setCurrentQuestion(sectionQuestions[currentIndex + 1]);
        } else {
            // If it's the last question, close the modal
            setIsModalOpen(false);
            setCurrentQuestion(null);
        }
    };

    const handleOpenQuestion = (question: HollandQuestion, section: TestSection) => {
        setActiveSection(section);
        setCurrentQuestion(question);
        setIsModalOpen(true);
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
                    const sectionQuestions = questions.filter(q => q.section === sec);

                    return (
                        <div key={sec}>
                             <div className="flex items-center gap-3 mb-3">
                                <SectionIcon className="w-6 h-6 text-primary" />
                                <h3 className="text-xl font-semibold text-foreground">{SECTION_DETAILS[sec].title}</h3>
                                {isComplete && <CheckCircle className="w-5 h-5 text-green-500" />}
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-2">
                                {sectionQuestions.map((q, index) => {
                                    const CategoryIcon = CATEGORY_DETAILS[q.category].icon;
                                    const categoryColor = CATEGORY_DETAILS[q.category].color;
                                    const isAnswered = answers[q.id] !== null;

                                    return (
                                        <button
                                            key={q.id}
                                            onClick={() => handleOpenQuestion(q, sec)}
                                            className={cn(
                                                "h-14 w-full border-2 rounded-md flex flex-col items-center justify-center transition-all",
                                                isAnswered ? 'bg-primary/20 border-primary' : 'bg-muted/50 border-muted-foreground/20 hover:bg-muted'
                                            )}
                                            title={q.text}
                                        >
                                            <span className={cn("text-lg font-bold", isAnswered ? 'text-primary-foreground' : 'text-muted-foreground')}>{index + 1}</span>
                                            <CategoryIcon className={cn("w-5 h-5", categoryColor)} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && currentQuestion && (
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
