'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, MessageSquare, Inbox, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from 'firebase/auth';
import { ChatWindow } from '@/components/chat/ChatModal';

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

export function SupportChatList() {
  const { user: adminUser } = useUser();
  const firestore = useFirestore();
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const chatsQuery = useMemo(() => {
    if (!firestore || !adminUser) return null;
    return query(collection(firestore, 'chats'), where('participants', 'array-contains', adminUser.uid));
  }, [firestore, adminUser]);

  const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

  const handleConversationClick = (user: UserProfile) => {
    setSelectedUser(user);
  };
  
  const handleCloseChat = () => {
    setSelectedUser(null);
  };

  const ChatRow = ({ chat }: { chat: Chat }) => {
    const otherUserId = chat.participants.find(p => p !== adminUser?.uid);
    const userProfileRef = useMemo(() => {
        if (!firestore || !otherUserId) return null;
        return doc(firestore, 'users', otherUserId);
    }, [firestore, otherUserId]);
    const { data: userProfile, isLoading: isLoadingUser } = useDoc<UserProfile>(userProfileRef);

    if (isLoadingUser || !userProfile) {
        return (
             <TableRow>
                <TableCell colSpan={4}>
                     <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                </TableCell>
            </TableRow>
        )
    }

    const getInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('') : '?';

    return (
        <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => handleConversationClick(userProfile)}>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={userProfile.profilePictureUrl} />
                        <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{userProfile.username}</span>
                </div>
            </TableCell>
            <TableCell className="max-w-xs truncate">
                 <p className={cn("text-muted-foreground", !chat.lastMessage.isRead && chat.lastMessage.senderId !== adminUser?.uid && "text-foreground font-semibold")}>
                    {chat.lastMessage.senderId === adminUser?.uid && "Tú: "}
                    {chat.lastMessage.text}
                </p>
            </TableCell>
            <TableCell className="text-right">
                {formatDistanceToNow(new Date(chat.lastMessage.timestamp.seconds * 1000), { addSuffix: true, locale: es })}
            </TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="sm"><MessageSquare className="mr-2 h-4 w-4" /> Responder</Button>
            </TableCell>
        </TableRow>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!chats || chats.length === 0) {
     return (
        <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
            <Inbox className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold">Bandeja de Entrada Vacía</h3>
            <p>Aún no hay conversaciones de soporte.</p>
        </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Último Mensaje</TableHead>
            <TableHead className="text-right">Fecha</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {chats.sort((a,b) => b.lastMessage.timestamp.seconds - a.lastMessage.timestamp.seconds).map(chat => (
                <ChatRow key={chat.id} chat={chat} />
            ))}
        </TableBody>
      </Table>
       {selectedUser && adminUser && (
            <ChatWindow 
                currentUser={adminUser as User}
                recipientUser={selectedUser}
                onClose={handleCloseChat}
            />
        )}
    </>
  );
}