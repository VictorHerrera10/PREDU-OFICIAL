'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase';
import api from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import Image from 'next/image';
import { questions, CATEGORY_DETAILS, SECTION_DETAILS, TestSection, HollandQuestion } from './psychological-test-data';
import { cn } from '@/lib/utils';

type Answers = Record<string, 'yes' | 'no' | null>;

type Props = {
    setPredictionResult: (result: string | null) => void;
};

export function PsychologicalTest({ setPredictionResult }: Props) {
    const { user } = useUser();
    const { toast } = useToast();
    const [answers, setAnswers] = useState<Answers>(() => 
        questions.reduce((acc, q) => ({ ...acc, [q.id]: null }), {})
    );
    const [activeSection, setActiveSection] = useState<TestSection | null>(null);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const progress = useMemo(() => {
        const answeredCount = Object.values(answers).filter(a => a !== null).length;
        const totalCount = questions.length;
        const sectionProgress = (section: TestSection) => {
            const sectionQuestions = questions.filter(q => q.section === section);
            const answeredInSection = sectionQuestions.filter(q => answers[q.id] !== null).length;
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
        if (emblaApi) {
            if (emblaApi.canScrollNext()) {
                emblaApi.scrollNext();
            } else {
                // Last question of the section answered, close the carousel view
                setActiveSection(null);
            }
        }
    };
    
    const handleSelectQuestion = (index: number) => {
        emblaApi?.scrollTo(index);
    };

    const handleStartSection = (section: TestSection) => {
        setActiveSection(section);
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
            toast({ variant: "destructive", title: "Error en el Análisis", description: error.message || "No se pudo conectar con el servicio de predicción." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {activeSection ? (
                     <motion.div
                        key="test-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="text-center mb-4">
                            <h3 className="text-xl font-bold text-primary flex items-center justify-center gap-2">
                                {SECTION_DETAILS[activeSection].icon && <SECTION_DETAILS[activeSection].icon className="w-6 h-6" />}
                                {SECTION_DETAILS[activeSection].title}
                            </h3>
                            <Button variant="ghost" onClick={() => setActiveSection(null)} className="mt-2 text-sm text-muted-foreground">Volver a las secciones</Button>
                        </div>

                        <div className="overflow-hidden" ref={emblaRef}>
                            <div className="flex">
                                {currentSectionQuestions.map((q) => (
                                    <div key={q.id} className="flex-[0_0_100%] min-w-0 p-2">
                                        <div className="border rounded-lg p-6 text-center bg-card/50">
                                            <p className="text-lg font-semibold mb-4 h-12 flex items-center justify-center">{q.text}</p>
                                            <Image 
                                                src={q.gifUrl} 
                                                alt={q.text} 
                                                width={400} 
                                                height={200} 
                                                className="rounded-md mx-auto mb-6 aspect-video object-cover" 
                                            />
                                            <div className="flex justify-center gap-4">
                                                <Button size="lg" variant="outline" className="text-green-500 border-green-500 hover:bg-green-500/10 hover:text-green-400" onClick={() => handleAnswer(q.id, 'yes')}>
                                                    <ThumbsUp className="mr-2" /> Sí
                                                </Button>
                                                <Button size="lg" variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10 hover:text-red-400" onClick={() => handleAnswer(q.id, 'no')}>
                                                    <ThumbsDown className="mr-2" /> No
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center gap-2 mt-4 flex-wrap">
                            {currentSectionQuestions.map((q, index) => {
                                const CategoryIcon = CATEGORY_DETAILS[q.category].icon;
                                const categoryColor = CATEGORY_DETAILS[q.category].color;
                                const isAnswered = answers[q.id] !== null;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => handleSelectQuestion(index)}
                                        className={cn(
                                            "h-10 w-10 border-2 rounded-md flex flex-col items-center justify-center transition-all",
                                            isAnswered ? 'bg-primary/20 border-primary' : 'bg-muted/50 border-muted-foreground/20'
                                        )}
                                        title={q.category}
                                    >
                                        <span className={cn("text-xs font-bold", isAnswered ? 'text-primary-foreground' : 'text-muted-foreground')}>{index + 1}</span>
                                        <CategoryIcon className={cn("w-3 h-3", categoryColor)} />
                                    </button>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="sections-view"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             {(Object.keys(SECTION_DETAILS) as TestSection[]).map(sec => {
                                const SectionIcon = SECTION_DETAILS[sec].icon;
                                const isComplete = progress[sec] === 100;
                                return (
                                    <Button key={sec} variant="outline" className="h-24 text-lg flex-col gap-2" onClick={() => handleStartSection(sec)}>
                                        <div className="flex items-center gap-2">
                                            <SectionIcon />
                                            <span>{SECTION_DETAILS[sec].title}</span>
                                        </div>
                                        {isComplete && <CheckCircle className="w-4 h-4 text-green-500 absolute top-2 right-2" />}
                                    </Button>
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
