'use client';

import { useState, useMemo } from 'react';
import { User } from 'firebase/auth';
import { motion } from 'framer-motion';
import { useCollection, useFirestore, useDoc } from '@/firebase';
import { collection, query, where, doc, limit } from 'firebase/firestore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { MessagesSquare, Loader2, Inbox as InboxIcon, ShieldAlert } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChatWindow } from './ChatModal';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { markChatAsRead } from '@/app/actions';

type UserProfile = {
    id: string;
    username: string;
    profilePictureUrl?: string;
    status?: 'online' | 'offline';
};

type Chat = {
    id: string;
    participants: string[];
    lastMessage: {
        text: string;
        senderId: string;
        timestamp: { seconds: number };
        isRead: boolean;
    };
};

function ConversationItem({ chat, currentUser, onClick }: { chat: Chat; currentUser: User; onClick: (user: UserProfile) => void }) {
    const firestore = useFirestore();
    const otherUserId = chat.participants.find(p => p !== currentUser.uid);

    const userProfileRef = useMemo(() => {
        if (!firestore || !otherUserId) return null;
        return doc(firestore, 'users', otherUserId);
    }, [firestore, otherUserId]);

    const { data: userProfile, isLoading } = useDoc<UserProfile>(userProfileRef);

    const getInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('') : '?';
    
    const isUnread = chat.lastMessage.senderId !== currentUser.uid && !chat.lastMessage.isRead;

    if (isLoading || !userProfile) {
        return (
            <div className="flex items-center gap-4 p-3 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-grow space-y-2">
                    <div className="h-4 w-1/2 bg-muted rounded" />
                    <div className="h-3 w-3/4 bg-muted rounded" />
                </div>
            </div>
        );
    }
    
    return (
        <button onClick={() => onClick(userProfile)} className="w-full text-left flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors">
            <div className="relative">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={userProfile.profilePictureUrl} />
                    <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                </Avatar>
                <span className={cn(
                    "absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background",
                    userProfile.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                )} />
            </div>
            <div className="flex-grow overflow-hidden">
                <p className={cn("font-semibold truncate", isUnread && "text-primary")}>{userProfile.username}</p>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage.text}</p>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(chat.lastMessage.timestamp.seconds * 1000), { addSuffix: true, locale: es })}
            </div>
        </button>
    );
}

export function Inbox({ user }: { user: User }) {
    const firestore = useFirestore();
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [isInboxOpen, setIsInboxOpen] = useState(false);

    const chatsQuery = useMemo(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'chats'), where('participants', 'array-contains', user.uid));
    }, [firestore, user]);

    const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

    const currentUserProfileRef = useMemo(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: currentUserProfile } = useDoc<UserProfile>(currentUserProfileRef);
    
    const adminUserQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'admin'), limit(1));
    }, [firestore]);
    const { data: adminUsers, isLoading: isLoadingAdmin } = useCollection<UserProfile>(adminUserQuery);
    const adminUser = adminUsers?.[0];

    const unreadCount = useMemo(() => {
        if (!chats) return 0;
        return chats.filter(chat => chat.lastMessage.senderId !== user.uid && !chat.lastMessage.isRead).length;
    }, [chats, user.uid]);

    const handleConversationClick = (recipient: UserProfile) => {
        setSelectedUser(recipient);
        setIsInboxOpen(false); // Close inbox when a chat is opened
        const chatId = recipient.id < user.uid ? `chat_${recipient.id}_${user.uid}` : `chat_${user.uid}_${recipient.id}`;
        markChatAsRead(chatId);
    };
    
    const handleSupportClick = () => {
        if(adminUser) {
            setSelectedUser(adminUser);
            setIsInboxOpen(false);
        }
    }
    
    const handleCloseChat = () => {
        setSelectedUser(null);
    };

    return (
        <>
            <Sheet open={isInboxOpen} onOpenChange={setIsInboxOpen}>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <SheetTrigger asChild>
                                 <motion.div
                                    initial={{ scale: 0, y: 50 }}
                                    animate={{ scale: 1, y: 0 }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
                                    className="relative"
                                >
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-16 w-16 rounded-full shadow-lg flex items-center justify-center animate-[pulse-glow_4s_ease-in-out_infinite]"
                                    >
                                        <MessagesSquare style={{ width: '32px', height: '32px' }} />
                                        <span className="sr-only">Bandeja de Entrada</span>
                                    </Button>
                                    <span className={cn(
                                        "absolute top-1 right-1 block h-3 w-3 rounded-full ring-2 ring-background",
                                        currentUserProfile?.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                    )} />
                                    {unreadCount > 0 && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="absolute -top-1 left-0"
                                        >
                                            <Badge variant="destructive" className="rounded-full h-6 w-6 flex items-center justify-center p-0 text-xs">
                                                {unreadCount}
                                            </Badge>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </SheetTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>Bandeja de Entrada</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <SheetContent className="flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="flex items-center gap-2">
                            <MessagesSquare /> Bandeja de Entrada
                        </SheetTitle>
                    </SheetHeader>
                     {adminUser && (
                        <div className="border-b pb-2 mb-2">
                            <Button onClick={handleSupportClick} className="w-full" variant="outline">
                                <ShieldAlert className="mr-2 h-4 w-4 text-primary" />
                                Contactar a Soporte Técnico
                            </Button>
                        </div>
                    )}
                    <div className="flex-grow overflow-y-auto -mx-6 px-6">
                        {isLoading ? (
                             <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : chats && chats.length > 0 ? (
                            <div className="space-y-2">
                                {chats.sort((a,b) => b.lastMessage.timestamp.seconds - a.lastMessage.timestamp.seconds).map(chat => (
                                    <ConversationItem key={chat.id} chat={chat} currentUser={user} onClick={handleConversationClick} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                                <InboxIcon className="h-12 w-12 mb-4"/>
                                <p className="font-semibold">No hay mensajes</p>
                                <p className="text-sm">Inicia una conversación desde la lista de usuarios.</p>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {selectedUser && (
                <ChatWindow
                    currentUser={user}
                    recipientUser={selectedUser}
                    onClose={handleCloseChat}
                />
            )}
        </>
    );
}
