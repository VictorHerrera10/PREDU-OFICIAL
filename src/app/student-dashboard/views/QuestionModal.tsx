'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ThumbsUp, ThumbsDown, X, AlertTriangle, ArrowLeft, ArrowRight, Check, Ban } from 'lucide-react';
import { HollandQuestion, CATEGORY_DETAILS, QuestionCategory, TestSection } from './psychological-test-data';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type QuestionModalProps = {
    question: HollandQuestion;
    allQuestions: HollandQuestion[];
    answer: 'yes' | 'no' | null;
    onAnswer: (questionId: string, answer: 'yes' | 'no') => void;
    onNavigate: (direction: 'next' | 'prev') => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    isLocked?: boolean;
};

// A special version of WindowControls for the modal
function QuestionWindowControls({ questionNumber, totalQuestions, category, onClose }: { questionNumber: number, totalQuestions: number, category: QuestionCategory, onClose: () => void }) {
    const categoryDetails = CATEGORY_DETAILS[category];
    const CategoryIcon = categoryDetails.icon;

    return (
        <div className="relative flex items-center justify-center h-10 px-4 bg-muted/30 border-b border-border/50">
           <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Logo iconOnly/>
                <span>
                    Pregunta {questionNumber}/{totalQuestions}
                </span>
                 <span className="mx-2 text-muted-foreground/50">|</span>
                <div className="flex items-center gap-1.5" style={{ color: categoryDetails.color }}>
                   <CategoryIcon className="h-4 w-4" />
                   <span className="text-sm font-semibold capitalize">{category}</span>
                </div>
            </div>
            <div className="absolute right-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary/50" />
                <div className="w-3 h-3 rounded-full bg-secondary/50" />
                 <button onClick={onClose} className="w-3 h-3 rounded-full bg-destructive/50 hover:bg-destructive/80 transition-colors flex items-center justify-center">
                   <X className="h-2 w-2 text-destructive-foreground/70" />
                </button>
            </div>
        </div>
    );
}

export function QuestionModal({
    question,
    allQuestions,
    answer,
    onAnswer,
    onNavigate,
    isOpen,
    setIsOpen,
    isLocked = false,
}: QuestionModalProps) {

    const questionIndex = allQuestions.findIndex(q => q.id === question.id);
    const questionNumber = questionIndex + 1;
    const totalQuestions = allQuestions.length;
    
    const handleAnswerClick = (selectedAnswer: 'yes' | 'no') => {
        if (isLocked) return;
        onAnswer(question.id, selectedAnswer);
    };
    
    const getButtonLabels = (section: TestSection): { yes: string, no: string, yesIcon: React.ElementType, noIcon: React.ElementType } => {
        switch (section) {
            case 'actividades':
                return { yes: 'Me Agrada', no: 'No me Agrada', yesIcon: Check, noIcon: Ban };
            case 'habilidades':
                return { yes: 'Sí, puedo hacerlo', no: 'No, no puedo', yesIcon: ThumbsUp, noIcon: ThumbsDown };
            case 'ocupaciones':
                return { yes: 'Sí, me interesa', no: 'No, no me interesa', yesIcon: ThumbsUp, noIcon: ThumbsDown };
            default:
                return { yes: 'Sí', no: 'No', yesIcon: ThumbsUp, noIcon: ThumbsDown };
        }
    };

    const { yes: yesLabel, no: noLabel, yesIcon: YesIcon, noIcon: NoIcon } = getButtonLabels(question.section);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="p-0 border-0 max-w-lg shadow-none bg-transparent" onInteractOutside={(e) => e.preventDefault()}>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Card className="bg-card/80 backdrop-blur-lg border-border/50 overflow-hidden">
                        <DialogHeader className="sr-only">
                            <DialogTitle>Pregunta {questionNumber} de {totalQuestions}</DialogTitle>
                            <DialogDescription>{question.text}</DialogDescription>
                        </DialogHeader>
                        <QuestionWindowControls questionNumber={questionNumber} totalQuestions={totalQuestions} category={question.category} onClose={() => setIsOpen(false)}/>
                        <CardContent className="p-6">
                            <div className="text-center overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={question.id}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    >
                                        <p className="text-lg font-semibold mb-4 h-12 flex items-center justify-center">{question.text}</p>
                                        <Image 
                                            src={question.gifUrl} 
                                            alt={question.text} 
                                            width={400} 
                                            height={200} 
                                            className="rounded-md mx-auto mb-6 aspect-video object-cover" 
                                        />
                                    </motion.div>
                                </AnimatePresence>

                                {answer && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-4 text-xs text-destructive flex items-center justify-center gap-1.5"
                                    >
                                        <AlertTriangle className="h-4 w-4" />
                                        Ya respondiste esta pregunta, pero puedes cambiar tu elección.
                                    </motion.div>
                                )}
                                <div className="relative flex justify-center items-center h-12">
                                    <div className="absolute left-0 bottom-0">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => onNavigate('prev')}
                                            disabled={questionIndex === 0}
                                            aria-label="Pregunta anterior"
                                        >
                                            <ArrowLeft />
                                        </Button>
                                    </div>
                                    <div className="flex justify-center items-center gap-4">
                                        <Button 
                                            size="lg" 
                                            variant={answer === 'yes' ? 'secondary' : 'outline'} 
                                            className={cn("border-green-500 hover:bg-green-500/10 hover:text-green-400 min-w-[140px]", answer === 'yes' ? "bg-green-500/20 text-green-300" : "text-green-500")} 
                                            onClick={() => handleAnswerClick('yes')}
                                            disabled={isLocked}
                                        >
                                            <YesIcon className="mr-2" /> {yesLabel}
                                        </Button>
                                        <Button 
                                            size="lg" 
                                            variant={answer === 'no' ? 'secondary' : 'outline'} 
                                            className={cn("border-red-500 hover:bg-red-500/10 hover:text-red-400 min-w-[140px]", answer === 'no' ? "bg-red-500/20 text-red-300" : "text-red-500")} 
                                            onClick={() => handleAnswerClick('no')}
                                            disabled={isLocked}
                                        >
                                            <NoIcon className="mr-2" /> {noLabel}
                                        </Button>
                                    </div>
                                    <div className="absolute right-0 bottom-0">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            onClick={() => onNavigate('next')}
                                            disabled={questionIndex === totalQuestions - 1}
                                            aria-label="Siguiente pregunta"
                                        >
                                            <ArrowRight />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
