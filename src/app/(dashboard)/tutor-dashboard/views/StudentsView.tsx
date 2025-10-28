'use client';

import { useMemo, useState } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, MessageSquare, ChevronDown } from 'lucide-react';
import { ChatWindow } from '@/components/chat/ChatModal';
import { Button } from '@/components/ui/button';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentProgressCard } from './StudentProgressCard';
import { cn } from '@/lib/utils';

type UserProfile = {
  id: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  institutionId?: string;
};

export default function StudentsList() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [selectedUserForChat, setSelectedUserForChat] = useState<UserProfile | null>(null);
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    
    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const studentsQuery = useMemo(() => {
        if (!userProfile?.institutionId || !firestore) return null;
        return query(
            collection(firestore, 'users'), 
            where('institutionId', '==', userProfile.institutionId),
            where('role', '==', 'student')
        );
    }, [userProfile, firestore]);

    const { data: students, isLoading: areStudentsLoading } = useCollection<UserProfile>(studentsQuery);
    
    const isLoading = isProfileLoading || areStudentsLoading;

    const getInitials = (name?: string | null) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
    };

    const toggleStudentDetails = (studentId: string) => {
        setExpandedStudentId(prevId => (prevId === studentId ? null : studentId));
    };


    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }
    
    return (
        <>
            {students && students.length > 0 ? (
                <div className="space-y-3">
                    {students.map(student => (
                        <motion.div
                            key={student.id}
                            layout
                            className="border rounded-lg bg-background/50 overflow-hidden"
                        >
                            <div 
                                className="flex items-center gap-4 p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                                onClick={() => toggleStudentDetails(student.id)}
                            >
                                <Avatar>
                                    <AvatarImage src={student.profilePictureUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${student.username}`} />
                                    <AvatarFallback>{getInitials(student.username)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold">{student.username}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {student.email}</p>
                                </div>
                                <div className="flex items-center">
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedUserForChat(student); }}>
                                        <MessageSquare className="h-5 w-5 text-primary"/>
                                    </Button>
                                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", expandedStudentId === student.id && "rotate-180")} />
                                </div>
                            </div>
                            <AnimatePresence>
                                {expandedStudentId === student.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="p-4 border-t">
                                            <StudentProgressCard studentId={student.id} studentName={student.username} />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            ) : (
                 <p className="text-muted-foreground text-center py-8">
                    Aún no hay estudiantes registrados en tu institución.
                </p>
            )}
            {selectedUserForChat && user && (
                <ChatWindow 
                    currentUser={user as FirebaseUser}
                    recipientUser={selectedUserForChat}
                    onClose={() => setSelectedUserForChat(null)}
                />
            )}
        </>
    );
}
