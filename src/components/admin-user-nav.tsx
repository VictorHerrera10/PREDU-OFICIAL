'use client';

import { useMemo, useState } from 'react';
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
import { User as UserIcon, Star, LogOut } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import { handleLogout } from './logout-button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AdminNotifications } from '@/app/admin/admin-notifications';

type UserProfile = {
  id?: string;
  username?: string;
  email?: string;
  profilePictureUrl?: string;
  role?: 'student' | 'tutor' | 'admin';
};

export function AdminUserNav() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const getInitials = (name?: string | null) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('');
  };
  
  const isLoading = isUserLoading || isProfileLoading;
  const profilePicture = userProfile?.profilePictureUrl || user?.photoURL;
  const displayName = userProfile?.username || user?.displayName;
  const displayEmail = user?.email;
  const profileLink = '/admin';

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
        <span>Bienvenido,</span>
        <span className="font-bold text-foreground">{displayName}!</span>
        <span className="text-xl">👑</span>
      </motion.div>
      <div className="flex items-center gap-2">
        <AdminNotifications />
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
                    <span>Panel</span>
                    </Link>
                </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Salir</span>
                    </DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro, {displayName}? 😢</AlertDialogTitle>
                <AlertDialogDescription>
                   Tu sesión como administrador se cerrará.
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
