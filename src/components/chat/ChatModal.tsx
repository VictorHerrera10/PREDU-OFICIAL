'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { sendMessage } from '@/app/actions';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Smile, X, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';


type RecipientUser = { 
    id: string, 
    username: string, 
    profilePictureUrl?: string,
    status?: 'online' | 'offline';
    lastSeen?: { seconds: number };
};


type ChatWindowProps = {
    currentUser: User;
    recipientUser: RecipientUser;
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


const EMOJIS = ['👍', '😂', '❤️', '🙏', '🔥', '🚀', '🤔', '🎉', '👋', '💯', '✅', '💡'];


export function ChatWindow({ currentUser, recipientUser: initialRecipientUser, onClose }: ChatWindowProps) {
    const firestore = useFirestore();
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const recipientProfileRef = useMemo(() => {
        if (!firestore || !initialRecipientUser) return null;
        return doc(firestore, 'users', initialRecipientUser.id);
    }, [firestore, initialRecipientUser]);

    const { data: recipientUser } = useDoc<RecipientUser>(recipientProfileRef);


    const chatId = useMemo(() => getChatId(currentUser.uid, initialRecipientUser.id), [currentUser.uid, initialRecipientUser.id]);

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
            receiverId: initialRecipientUser.id,
        };

        setInput('');
        await sendMessage(chatId, messageData);
        setIsSending(false);
    };

    const handleEmojiClick = (emoji: string) => {
        setInput(prev => prev + emoji);
    };


    const getInitials = (name?: string | null) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
    };

    const cardVariants = {
        open: { height: 500, opacity: 1 },
        minimized: { height: 40, opacity: 1 }
    };


    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-4 right-24 z-50"
        >
            <motion.div
                layout
                variants={cardVariants}
                animate={isMinimized ? 'minimized' : 'open'}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="w-[400px] flex flex-col bg-card/80 backdrop-blur-lg border-border/50 overflow-hidden shadow-2xl rounded-lg"
            >
                 <header className="relative flex items-center justify-center h-10 px-4 bg-muted/30 border-b border-border/50 flex-shrink-0 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={recipientUser?.profilePictureUrl} />
                            <AvatarFallback>{getInitials(recipientUser?.username)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-bold text-foreground">{recipientUser?.username}</span>
                        <span className={cn(
                            "h-2 w-2 rounded-full",
                            recipientUser?.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                        )} />
                    </div>
                    <div className="absolute right-4 flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="w-3 h-3 rounded-full bg-yellow-500/50 hover:bg-yellow-500/80 transition-colors flex items-center justify-center">
                            <Minus className="h-2 w-2 text-white/70" />
                        </button>
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-3 h-3 rounded-full bg-destructive/50 hover:bg-destructive/80 transition-colors flex items-center justify-center">
                            <X className="h-2 w-2 text-destructive-foreground/70" />
                        </button>
                    </div>
                </header>
                
                <AnimatePresence>
                    {!isMinimized && (
                         <motion.div 
                            className="flex-grow flex flex-col overflow-hidden"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                         >
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
                                                        initial={{ opacity: 0, y: 10, x: isCurrentUser ? 20 : -20 }}
                                                        animate={{ opacity: 1, y: 0, x: 0 }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                                        className={cn('flex items-end gap-2', isCurrentUser && 'justify-end')}
                                                    >
                                                        <div className={cn(
                                                            "flex items-end gap-2", 
                                                            isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                                                        )}>
                                                            <div className={cn(
                                                                "relative max-w-xs md:max-w-sm px-3 py-2 text-sm rounded-lg shadow-md",
                                                                isCurrentUser 
                                                                    ? "bg-primary text-primary-foreground" 
                                                                    : "bg-secondary text-secondary-foreground"
                                                            )}
                                                            style={{
                                                                clipPath: isCurrentUser
                                                                    ? 'polygon(0% 0%, 100% 0%, 100% 100%, 15% 100%, 0 85%)'
                                                                    : 'polygon(0% 0%, 100% 0%, 100% 85%, 85% 100%, 0 100%)',
                                                            }}
                                                            >
                                                                <p>{message.text}</p>
                                                            </div>
                                                            {message.timestamp && (
                                                                <p className={cn("text-xs mb-1", isCurrentUser ? "text-primary-foreground/70" : "text-secondary-foreground/70")}>
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

                            <CardFooter className="p-2 border-t">
                                <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button type="button" variant="ghost" size="icon" className="flex-shrink-0">
                                                <Smile className="h-5 w-5" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-2">
                                            <div className="grid grid-cols-6 gap-1">
                                                {EMOJIS.map(emoji => (
                                                    <Button
                                                        key={emoji}
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEmojiClick(emoji)}
                                                        className="text-xl"
                                                    >
                                                        {emoji}
                                                    </Button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        placeholder="Escribe un mensaje..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        disabled={isSending}
                                        autoComplete="off"
                                        className="bg-background/50"
                                    />
                                    <Button type="submit" disabled={!input.trim() || isSending} className="flex-shrink-0 btn-retro !h-10 !px-4">
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </form>
                            </CardFooter>
                         </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
