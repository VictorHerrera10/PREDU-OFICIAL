'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, deleteDoc, doc, orderBy, query, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type Notification = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  createdAt: { seconds: number; nanoseconds: number };
  read: boolean;
};

export function AdminNotifications() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const notificationsQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'notifications'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: notifications } = useCollection<Notification>(notificationsQuery);

  const unreadCount = useMemo(() => {
    if (!notifications) return 0;
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const handleMarkAsRead = async (id: string) => {
    if (!firestore) return;
    try {
        const notifRef = doc(firestore, 'notifications', id);
        await updateDoc(notifRef, { read: true });
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo marcar como leída.',
        });
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
        const notifRef = doc(firestore, 'notifications', id);
        await deleteDoc(notifRef);
        toast({
            title: 'Notificación eliminada',
            description: 'La notificación ha sido eliminada con éxito.',
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Error al eliminar',
            description: 'No se pudo eliminar la notificación.',
        });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full p-0">
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground animate-pulse"
            >
              {unreadCount}
            </motion.span>
          )}
          <span className="sr-only">Notificaciones</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notificaciones</span>
          {unreadCount > 0 && <Badge>{unreadCount} nueva(s)</Badge>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <AnimatePresence>
          {!notifications || notifications.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <DropdownMenuItem disabled className="text-center justify-center text-muted-foreground">
                No tienes notificaciones.
              </DropdownMenuItem>
            </motion.div>
          ) : (
            notifications.map((notif, index) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn("relative rounded-lg mb-2", !notif.read && "bg-primary/10")}
              >
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex flex-col items-start gap-1.5 p-3 whitespace-normal">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{notif.emoji}</span>
                    <p className="font-bold">{notif.title}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.description}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(notif.createdAt.seconds * 1000), 'dd/MM/yy HH:mm')}</span>
                  </div>
                </DropdownMenuItem>
                <div className="absolute top-2 right-2 flex gap-1">
                   {!notif.read && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500" onClick={() => handleMarkAsRead(notif.id)} title="Marcar como leída">
                            <Check className="h-4 w-4" />
                        </Button>
                    )}
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDelete(notif.id)} title="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
