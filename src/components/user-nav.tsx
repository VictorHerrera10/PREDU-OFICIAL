'use client';

import { useMemo, useState, useRef } from 'react';
import { useUser, useFirestore, useDoc, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon, Star, LogOut, Check, Trash2, Bell, Clock } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import { handleLogout } from './logout-button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/use-notifications';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';


type UserProfile = {
  id?: string;
  username?: string;
  email?: string;
  profilePictureUrl?: string;
  role?: 'student' | 'tutor' | 'admin';
  tutorDetails?: {
    roleInInstitution?: 'psicologo' | 'docente' | 'director' | 'autoridades gubernamentales';
  }
};

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };

  const getWelcomeDetails = (profile: UserProfile | null) => {
    if (profile?.role === 'tutor') {
        switch (profile.tutorDetails?.roleInInstitution) {
            case 'docente':
                return { title: '¡Hola, Prof.', emoji: '🧑‍🏫' };
            case 'psicologo':
                return { title: '¡Hola, Psic.', emoji: '🧠' };
            case 'director':
                return { title: '¡Hola, Dir.', emoji: '👑' };
            case 'autoridades gubernamentales':
                return { title: '¡Hola, Aut.', emoji: '💼' };
            default:
                return { title: '¡Hola, Tutor', emoji: '🧑‍🏫' };
        }
    }
    return { title: 'Bienvenido,', emoji: <Star className="w-4 h-4 text-primary" /> };
};


  const isLoading = isUserLoading || isProfileLoading;
  const profilePicture = userProfile?.profilePictureUrl || user?.photoURL;
  const displayName = userProfile?.username || user?.displayName;
  const displayEmail = user?.email;

  const { title: welcomeTitle, emoji: welcomeEmoji } = useMemo(
    () => getWelcomeDetails(userProfile),
    [userProfile]
);


  const profileLink = useMemo(() => {
    switch (userProfile?.role) {
      case 'student':
        return '/student-dashboard/profile';
      case 'tutor':
        return '/tutor-dashboard/profile';
      default:
        return '/dashboard'; // Fallback for admin or undefined roles
    }
  }, [userProfile?.role]);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <motion.div
        className="hidden md:flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span>{welcomeTitle}</span>
        <span className="font-bold text-foreground">{displayName}!</span>
        <span className="text-xl">{welcomeEmoji}</span>
      </motion.div>
      <div className="flex items-center gap-2">
        {userProfile?.role !== 'admin' && (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full p-0">
                        <Bell className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <motion.span 
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground animate-pulse">
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
                        {notifications.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
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
                                            <span>{format(new Date(notif.createdAt), "dd/MM/yy HH:mm")}</span>
                                        </div>
                                    </DropdownMenuItem>
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        {!notif.read && (
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-green-500" onClick={() => markAsRead(notif.id)} title="Marcar como leída">
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => deleteNotification(notif.id)} title="Eliminar">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </DropdownMenuContent>
            </DropdownMenu>
        )}

        <AlertDialog>
            <DropdownMenu open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar
                    className={cn(
                    'h-10 w-10 border-2 transition-all duration-300',
                    isUserMenuOpen ? 'border-destructive' : 'border-primary animate-[pulse-glow_3s_ease-in-out_infinite]'
                    )}
                >
                    <AvatarImage src={profilePicture as string | undefined} alt={displayName || ''} />
                    <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {displayEmail}
                    </p>
                </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link href={profileLink}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Mi Perfil</span>
                    </Link>
                </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Salir del Aula</span>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Ya te vas, {displayName}? 😢</AlertDialogTitle>
                <AlertDialogDescription>
                    El aula te extrañará. ¿Estás seguro de que quieres cerrar sesión?
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleLogout(auth, router, toast)} className={buttonVariants({variant: 'destructive'})}>
                    Sí, salir
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
