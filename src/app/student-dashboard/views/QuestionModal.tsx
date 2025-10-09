'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { HollandQuestion, CATEGORY_DETAILS, QuestionCategory } from './psychological-test-data';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

type QuestionModalProps = {
    question: HollandQuestion;
    allQuestions: HollandQuestion[];
    answer: 'yes' | 'no' | null;
    onAnswer: (questionId: string, answer: 'yes' | 'no') => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
};

// A special version of WindowControls for the modal
function QuestionWindowControls({ questionNumber, totalQuestions, category, onClose }: { questionNumber: number, totalQuestions: number, category: QuestionCategory, onClose: () => void }) {
    const categoryDetails = CATEGORY_DETAILS[category];
    const CategoryIcon = categoryDetails.icon;

    return (
        <div className="relative flex items-center justify-center h-10 px-4 bg-muted/30 border-b border-border/50">
           <DialogTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Logo iconOnly/>
                <span>
                    Pregunta {questionNumber}/{totalQuestions}
                </span>
                 <span className="mx-2 text-muted-foreground/50">|</span>
                <div className={cn("flex items-center gap-1.5", categoryDetails.color)}>
                   <CategoryIcon className="h-4 w-4" />
                   <span className="text-sm font-semibold capitalize">{category}</span>
                </div>
            </DialogTitle>
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
    isOpen,
    setIsOpen,
}: QuestionModalProps) {

    const questionNumber = allQuestions.findIndex(q => q.id === question.id) + 1;
    const totalQuestions = allQuestions.length;
    
    const handleAnswerClick = (selectedAnswer: 'yes' | 'no') => {
        onAnswer(question.id, selectedAnswer);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="p-0 border-0 max-w-lg shadow-none bg-transparent" onInteractOutside={(e) => e.preventDefault()}>
                <Card className="bg-card/80 backdrop-blur-lg border-border/50 overflow-hidden">
                    <QuestionWindowControls questionNumber={questionNumber} totalQuestions={totalQuestions} category={question.category} onClose={() => setIsOpen(false)}/>
                    <CardContent className="p-6">
                        <DialogDescription className="sr-only">{question.text}</DialogDescription>
                        <div className="text-center">
                             <p className="text-lg font-semibold mb-4 h-12 flex items-center justify-center">{question.text}</p>
                             <Image 
                                src={question.gifUrl} 
                                alt={question.text} 
                                width={400} 
                                height={200} 
                                className="rounded-md mx-auto mb-6 aspect-video object-cover" 
                            />
                            <div className="flex justify-center gap-4">
                                <Button 
                                    size="lg" 
                                    variant={answer === 'yes' ? 'secondary' : 'outline'} 
                                    className={cn("border-green-500 hover:bg-green-500/10 hover:text-green-400", answer === 'yes' ? "bg-green-500/20 text-green-300" : "text-green-500")} 
                                    onClick={() => handleAnswerClick('yes')}
                                >
                                    <ThumbsUp className="mr-2" /> Sí
                                </Button>
                                <Button 
                                    size="lg" 
                                    variant={answer === 'no' ? 'secondary' : 'outline'} 
                                    className={cn("border-red-500 hover:bg-red-500/10 hover:text-red-400", answer === 'no' ? "bg-red-500/20 text-red-300" : "text-red-500")} 
                                    onClick={() => handleAnswerClick('no')}
                                >
                                    <ThumbsDown className="mr-2" /> No
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
}
