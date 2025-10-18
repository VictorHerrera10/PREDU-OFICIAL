'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, serverTimestamp, addDoc } from 'firebase/firestore';
import { sendMessage } from '@/app/actions';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type ChatModalProps = {
    currentUser: User;
    recipientUser: { id: string, username: string, profilePictureUrl?: string };
    isOpen: boolean;
    onClose: () => void;
};

type Message = {
    id: string;
    text: string;
    senderId: string;
    timestamp: { seconds: number, nanoseconds: number } | null;
};

const getChatId = (uid1: string, uid2: string) => {
    return uid1 < uid2 ? `chat_${uid1}_${uid2}` : `chat_${uid2}_${uid1}`;
};

export function ChatModal({ currentUser, recipientUser, isOpen, onClose }: ChatModalProps) {
    const firestore = useFirestore();
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const chatId = useMemo(() => getChatId(currentUser.uid, recipientUser.id), [currentUser.uid, recipientUser.id]);

    const messagesQuery = useMemo(() => {
        if (!firestore || !chatId) return null;
        return query(collection(firestore, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    }, [firestore, chatId]);

    const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, isSending]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending) return;

        setIsSending(true);
        
        const messageData = {
            text: input,
            senderId: currentUser.uid,
            receiverId: recipientUser.id,
        };

        setInput('');

        await sendMessage(chatId, messageData);
        
        setIsSending(false);
    };

    const getInitials = (name?: string | null) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg h-[70vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b flex-row items-center gap-4 space-y-0">
                    <Avatar>
                        <AvatarImage src={recipientUser.profilePictureUrl} />
                        <AvatarFallback>{getInitials(recipientUser.username)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <DialogTitle>{recipientUser.username}</DialogTitle>
                        <DialogDescription>Conversación directa</DialogDescription>
                    </div>
                </DialogHeader>

                <div className="flex-grow overflow-hidden p-4">
                    <ScrollArea className="h-full pr-4" viewportRef={scrollAreaRef}>
                        {isLoading && (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        )}
                        <div className="space-y-4">
                            <AnimatePresence>
                                {messages?.map(message => {
                                    const isCurrentUser = message.senderId === currentUser.uid;
                                    return (
                                        <motion.div
                                            key={message.id}
                                            layout
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={cn('flex items-end gap-2', isCurrentUser && 'justify-end')}
                                        >
                                            <div className={cn(
                                                "relative max-w-xs md:max-w-sm px-4 py-2 text-sm rounded-lg shadow-md",
                                                isCurrentUser 
                                                    ? "bg-primary text-primary-foreground rounded-br-none" 
                                                    : "bg-secondary text-secondary-foreground rounded-bl-none"
                                            )}>
                                                <p>{message.text}</p>
                                                 {message.timestamp && (
                                                    <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70" : "text-secondary-foreground/70")}>
                                                        {format(new Date(message.timestamp.seconds * 1000), 'p', { locale: es })}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </div>

                <DialogFooter className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                        <Input
                            placeholder="Escribe un mensaje..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isSending}
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" disabled={!input.trim() || isSending}>
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
