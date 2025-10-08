'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { HollandQuestion } from './psychological-test-data';
import { Logo } from '@/components/logo';

type QuestionModalProps = {
    question: HollandQuestion;
    questionNumber: number;
    totalQuestions: number;
    answer: 'yes' | 'no' | null;
    onAnswer: (questionId: string, answer: 'yes' | 'no') => void;
    children: React.ReactNode;
};

// A special version of WindowControls for the modal
function QuestionWindowControls({ questionNumber, totalQuestions }: { questionNumber: number, totalQuestions: number }) {
    return (
        <div className="relative flex items-center justify-center h-10 px-4 bg-muted/30 border-b border-border/50">
            <div className="flex items-center gap-2">
                <Logo iconOnly/>
                <span className="text-sm font-bold text-foreground">
                    Pregunta {questionNumber}/{totalQuestions}
                </span>
            </div>
            <div className="absolute right-4 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary/50" />
                <div className="w-3 h-3 rounded-full bg-secondary/50" />
                <div className="w-3 h-3 rounded-full bg-destructive/50"/>
            </div>
        </div>
    );
}

export function QuestionModal({
    question,
    questionNumber,
    totalQuestions,
    onAnswer,
    children,
}: QuestionModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleAnswerClick = (answer: 'yes' | 'no') => {
        onAnswer(question.id, answer);
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="p-0 border-0 max-w-lg bg-transparent shadow-none">
                <Card className="bg-card/80 backdrop-blur-lg border-border/50 overflow-hidden">
                    <QuestionWindowControls questionNumber={questionNumber} totalQuestions={totalQuestions}/>
                    <CardContent className="p-6">
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
                                <Button size="lg" variant="outline" className="text-green-500 border-green-500 hover:bg-green-500/10 hover:text-green-400" onClick={() => handleAnswerClick('yes')}>
                                    <ThumbsUp className="mr-2" /> Sí
                                </Button>
                                <Button size="lg" variant="outline" className="text-red-500 border-red-500 hover:bg-red-500/10 hover:text-red-400" onClick={() => handleAnswerClick('no')}>
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
