'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Loader2, Sparkles, User as UserIcon } from 'lucide-react';
import { chatWithCounselor } from '@/ai/flows/vocational-guidance-flow';
import { useUser } from '@/firebase';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

export default function ChatbotView() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatWithCounselor({ message: input });
      const aiMessage: Message = { sender: 'ai', text: result.response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error with AI counselor:', error);
      const errorMessage: Message = { sender: 'ai', text: 'Lo siento, estoy teniendo problemas para conectar. Inténtalo de nuevo más tarde.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };

  return (
    <Card className="h-full w-full flex flex-col border-0 shadow-none rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-destructive" />
          Asistente Vocacional IA
        </CardTitle>
        <CardDescription>Chatea con nuestro orientador vocacional para resolver tus dudas.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
            <AnimatePresence>
                {messages.map((message, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}
                >
                    {message.sender === 'ai' && (
                    <Avatar className="h-8 w-8 border-2 border-destructive">
                        <AvatarFallback><Sparkles /></AvatarFallback>
                    </Avatar>
                    )}
                    <div
                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                    >
                    <p className="text-sm">{message.text}</p>
                    </div>
                     {message.sender === 'user' && (
                        <Avatar className="h-8 w-8">
                             <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                             <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                    )}
                </motion.div>
                ))}
                {isLoading && (
                     <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-start gap-3"
                    >
                         <Avatar className="h-8 w-8 border-2 border-destructive">
                            <AvatarFallback><Sparkles /></AvatarFallback>
                        </Avatar>
                        <div className="max-w-xs rounded-lg px-4 py-2 bg-secondary text-secondary-foreground">
                            <Loader2 className="w-5 h-5 animate-spin"/>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            id="message"
            placeholder="Escribe tu pregunta aquí..."
            className="flex-1"
            autoComplete="off"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-destructive hover:bg-destructive/90">
            <Send className="h-4 w-4" />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
