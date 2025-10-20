'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { useCollection, useDoc, useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { sendMessage, markChatAsRead } from '@/app/actions';

import { CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type UserProfile = {
  id: string;
  username: string;
  profilePictureUrl?: string;
  status?: 'online' | 'offline';
};

type ChatViewProps = {
    recipientUser: UserProfile;
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

export function AdminChatView({ recipientUser }: ChatViewProps) {
    const { user: adminUser } = useUser();
    const firestore = useFirestore();
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const chatId = useMemo(() => {
        if (!adminUser) return null;
        return getChatId(adminUser.uid, recipientUser.id);
    }, [adminUser, recipientUser.id]);

    const messagesQuery = useMemo(() => {
        if (!firestore || !chatId) return null;
        return query(collection(firestore, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'));
    }, [firestore, chatId]);

    const { data: messages, isLoading } = useCollection<Message>(messagesQuery);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'auto' });
        }
        if (chatId) {
            markChatAsRead(chatId);
        }
    }, [messages, chatId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isSending || !adminUser || !chatId) return;

        setIsSending(true);
        const messageData = { text: input, senderId: adminUser.uid, receiverId: recipientUser.id };
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

    return (
        <div className="h-full flex flex-col">
            <CardContent className="flex-grow p-4 overflow-hidden">
                <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
                    {isLoading && (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    <div className="space-y-4 px-4">
                        <AnimatePresence>
                            {messages?.map(message => {
                                const isCurrentUser = message.senderId === adminUser?.uid;
                                const userForAvatar = isCurrentUser ? adminUser : recipientUser;
                                const profileForAvatar = isCurrentUser ? null : recipientUser;

                                return (
                                    <motion.div
                                        key={message.id}
                                        layout
                                        initial={{ opacity: 0, y: 10, x: isCurrentUser ? 20 : -20 }}
                                        animate={{ opacity: 1, y: 0, x: 0 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        className={cn('flex items-end gap-2', isCurrentUser && 'justify-end')}
                                    >
                                        {!isCurrentUser && (
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                <AvatarImage src={profileForAvatar?.profilePictureUrl} />
                                                <AvatarFallback>{getInitials(profileForAvatar?.username)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn(
                                            "relative px-3 py-2 text-sm break-words max-w-xs md:max-w-md",
                                            isCurrentUser 
                                                ? "message-bubble-sent" 
                                                : "message-bubble-received"
                                        )}>
                                            <p>{message.text}</p>
                                        </div>
                                         {isCurrentUser && (
                                            <Avatar className="h-8 w-8 flex-shrink-0">
                                                <AvatarImage src={userForAvatar?.photoURL || undefined} />
                                                <AvatarFallback>{getInitials(userForAvatar?.displayName)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t">
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
                                    <Button key={emoji} variant="ghost" size="icon" onClick={() => handleEmojiClick(emoji)} className="text-xl">{emoji}</Button>
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
                        className="bg-input"
                    />
                    <Button type="submit" disabled={!input.trim() || isSending} className="flex-shrink-0 btn-retro !h-10 !px-4">
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
            </CardFooter>
        </div>
    );
}
