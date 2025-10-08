'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User as UserIcon } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';
import { LogoutButton } from './logout-button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';


type UserProfile = {
  id?: string;
  username?: string;
  email?: string;
  profilePictureUrl?: string;
};

// Animation variants for the container
const sentence = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.1,
      staggerChildren: 0.04,
    },
  },
};

// Animation variants for each letter for a subtle wave effect
const letter = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
  },
};


export function UserNav() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);

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

  const isLoading = isUserLoading || isProfileLoading;
  const profilePicture = userProfile?.profilePictureUrl || user?.photoURL;
  const displayName = userProfile?.username || user?.displayName;
  const displayEmail = user?.email;
  
  const welcomeText = `Bienvenido, ${displayName} 👋`;


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
        className="hidden md:flex text-sm font-medium text-muted-foreground"
        variants={sentence}
        initial="hidden"
        animate="visible"
      >
        {welcomeText.split("").map((char, index) => {
          // Check if char is part of displayName to make it bold
           const isNameChar = displayName?.includes(char) && char !== ' ';
           // Create a wave animation for each character
           const waveAnimation = {
             y: ["0%", "-20%", "0%"],
             transition: {
               duration: 1.5,
               ease: "easeInOut",
               repeat: Infinity,
               delay: index * 0.05,
             },
           };

          return (
            <motion.span
              key={char + "-" + index}
              variants={letter}
              animate={waveAnimation}
              className={cn({
                'whitespace-pre': char === ' ',
                'text-foreground font-bold': isNameChar,
                'inline-block': char !== ' ', // Prevents weird spacing with emoji
              })}
            >
              {char}
            </motion.span>
          )
        })}
      </motion.div>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar 
                    className={cn(
                        'h-10 w-10 border-2 transition-all duration-300',
                        isOpen ? 'border-destructive' : 'border-primary animate-[pulse-glow_3s_ease-in-out_infinite]'
                    )}
                >
                    <AvatarImage src={profilePicture} alt={displayName || ''} />
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
                <Link href="/student-dashboard/profile">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
                </Link>
            </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <LogoutButton className="w-full justify-start"/>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>
    </div>
  );
}
