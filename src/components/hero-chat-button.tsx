'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, Bot } from 'lucide-react';
import { chatWithCounselor } from '@/ai/flows/vocational-guidance-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

type UserProfile = {
  isHero?: boolean;
};

type AcademicPrediction = {
    prediction: string;
    grades: Record<string, string>;
};

type PsychologicalPrediction = {
    result: string;
};


export function HeroChatButton() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const academicDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'academic_prediction', user.uid);
  }, [user, firestore]);

  const psychologicalDocRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'psychological_predictions', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);
  const { data: academicPrediction } = useDoc<AcademicPrediction>(academicDocRef);
  const { data: psychologicalPrediction } = useDoc<PsychologicalPrediction>(psychologicalDocRef);


  useEffect(() => {
    if (isOpen && messages.length === 0 && user?.displayName) {
        const welcomeMessage: Message = {
            sender: 'ai',
            text: `¡Hola, ${user.displayName}! Soy tu Asistente Vocacional. Estoy aquí para ayudarte a explorar carreras, resolver tus dudas y encontrar tu camino. ¿En qué te puedo ayudar hoy? 🚀`,
        };
        setMessages([welcomeMessage]);
    }
  }, [isOpen, user, messages.length]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatWithCounselor({ 
          message: input,
          username: user?.displayName,
          academicPrediction: academicPrediction || undefined,
          psychologicalResult: psychologicalPrediction?.result,
      });
      const aiMessage: Message = { sender: 'ai', text: result.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error with AI counselor:', error);
      const errorMessage: Message = { sender: 'ai', text: '¡Ups! Parece que mis circuitos están un poco cruzados ahora mismo. Estoy teniendo algunas dificultades técnicas, pero el equipo técnico ya está trabajando para solucionarlo. ¡Inténtalo de nuevo en un momento! 🛠️' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  };

  if (!userProfile?.isHero) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
              >
                <Button
                  variant="destructive"
                  size="icon"
                  className="fixed bottom-24 right-6 z-30 h-16 w-16 rounded-full shadow-lg flex items-center justify-center animate-[pulse-glow_4s_ease-in-out_infinite]"
                >
                  <Bot className="h-10 w-10" />
                  <span className="sr-only">Asistente IA</span>
                </Button>
              </motion.div>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-destructive text-destructive-foreground">
            <p>Asistente Vocacional IA</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="max-w-xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-destructive flex-shrink-0">
                    <AvatarFallback><Bot className="h-10 w-10"/></AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-semibold">Asistente Vocacional</h2>
                  <p className="text-sm text-muted-foreground">Chatea con nuestro orientador vocacional para resolver tus dudas.</p>
                </div>
            </DialogTitle>
        </DialogHeader>
        
        <Card className="h-full w-full flex flex-col border-0 shadow-none rounded-t-none">
            <CardContent className="flex-grow overflow-hidden p-6 pt-0">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-6 pt-4">
                        <AnimatePresence>
                            {messages.map((message, index) => (
                                <motion.div
                                    key={index}
                                    layout
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className={cn('flex items-end gap-2', message.sender === 'user' && 'justify-end')}
                                >
                                    {message.sender === 'ai' && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                          <Avatar className="h-10 w-10 border-2 border-destructive flex-shrink-0">
                                              <AvatarFallback><Bot className="h-8 w-8"/></AvatarFallback>
                                          </Avatar>
                                        </motion.div>
                                    )}
                                    <div className={cn(
                                        "relative max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 text-sm",
                                        "shadow-md",
                                        {
                                          "bg-secondary text-secondary-foreground": message.sender === 'ai',
                                          "bg-primary text-primary-foreground": message.sender === 'user',
                                          "rounded-lg rounded-bl-none": message.sender === 'ai',
                                          "rounded-lg rounded-br-none": message.sender === 'user',
                                        }
                                    )}>
                                        <p>{message.text}</p>
                                    </div>
                                    {message.sender === 'user' && (
                                         <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                                                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                                            </Avatar>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div 
                                    key="loading" 
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-end gap-2"
                                >
                                    <Avatar className="h-10 w-10 border-2 border-destructive">
                                        <AvatarFallback><Bot className="h-8 w-8"/></AvatarFallback>
                                    </Avatar>
                                    <div className="rounded-lg rounded-bl-none px-4 py-3 bg-secondary text-secondary-foreground">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-4">
                    <Input
                        id="message"
                        placeholder="Escribe tu pregunta aquí..."
                        className="flex-1"
                        autoComplete="off"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-destructive hover:bg-destructive/90 rounded-full w-10 h-10 flex-shrink-0">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Enviar</span>
                    </Button>
                </form>
            </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
