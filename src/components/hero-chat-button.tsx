
'use client';

import { useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ChatbotView from '@/app/student-dashboard/views/ChatbotView';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type UserProfile = {
  isHero?: boolean;
};

export function HeroChatButton() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [isOpen, setIsOpen] = useState(false);

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  if (!userProfile?.isHero) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <motion.div
                            initial={{ scale: 0, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
                        >
                            <Button
                                variant="destructive"
                                size="icon"
                                className="fixed bottom-24 right-6 z-30 h-14 w-14 rounded-full shadow-lg flex items-center justify-center animate-[pulse-glow_4s_ease-in-out_infinite]"
                            >
                                <Sparkles className="h-7 w-7" />
                                <span className="sr-only">Asistente IA</span>
                            </Button>
                        </motion.div>
                    </DialogTrigger>
                </TooltipTrigger>
                 <TooltipContent side="left" className="bg-destructive text-destructive-foreground">
                    <p>¡Asistente IA!</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      <DialogContent className="max-w-xl h-[80vh] flex flex-col p-0">
        <ChatbotView />
      </DialogContent>
    </Dialog>
  );
}
