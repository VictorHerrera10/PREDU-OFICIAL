'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export type UserProfile = {
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

type SupportChatListProps = {
    onSelectChat: (user: UserProfile) => void;
    selectedUserId?: string;
};

export function SupportChatList({ onSelectChat, selectedUserId }: SupportChatListProps) {
  const { user: adminUser } = useUser();
  const firestore = useFirestore();

  const chatsQuery = useMemo(() => {
    if (!firestore || !adminUser) return null;
    return query(collection(firestore, 'chats'), where('participants', 'array-contains', adminUser.uid));
  }, [firestore, adminUser]);

  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

  const ChatRow = ({ chat }: { chat: Chat }) => {
    const otherUserId = chat.participants.find(p => p !== adminUser?.uid);
    const userProfileRef = useMemo(() => {
        if (!firestore || !otherUserId) return null;
        return doc(firestore, 'users', otherUserId);
    }, [firestore, otherUserId]);
    const { data: userProfile, isLoading: isLoadingUser } = useDoc<UserProfile>(userProfileRef);

    if (isLoadingUser || !userProfile) {
        return (
             <div className="flex items-center space-x-4 p-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
        );
    }

    const getInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('') : '?';
    const isUnread = chat.lastMessage.senderId !== adminUser?.uid && !chat.lastMessage.isRead;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
        >
            <Button 
                variant="ghost" 
                className={cn(
                    "w-full h-auto justify-start p-2",
                    selectedUserId === userProfile.id && 'bg-accent'
                )} 
                onClick={() => onSelectChat(userProfile)}
            >
                <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={userProfile.profilePictureUrl} />
                        <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow overflow-hidden text-left">
                         <p className={cn("font-semibold truncate", isUnread && "text-primary")}>{userProfile.username}</p>
                        <p className="text-xs text-muted-foreground truncate">
                             {chat.lastMessage.senderId === adminUser?.uid && "Tú: "}
                            {chat.lastMessage.text}
                        </p>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap self-start">
                        {formatDistanceToNow(new Date(chat.lastMessage.timestamp.seconds * 1000), { addSuffix: true, locale: es })}
                    </div>
                </div>
            </Button>
        </motion.div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8 h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!chats || chats.length === 0) {
     return (
        <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg h-full flex flex-col justify-center items-center">
            <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold">Bandeja Vacía</h3>
            <p className="text-sm">Aún no hay conversaciones.</p>
        </div>
    );
  }

  return (
    <ScrollArea className="h-full">
        <div className="space-y-1">
            {chats.sort((a,b) => b.lastMessage.timestamp.seconds - a.lastMessage.timestamp.seconds).map(chat => (
                <ChatRow key={chat.id} chat={chat} />
            ))}
        </div>
    </ScrollArea>
  );
}
