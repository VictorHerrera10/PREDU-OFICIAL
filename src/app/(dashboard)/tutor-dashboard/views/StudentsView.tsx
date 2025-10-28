'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, MessageSquare, ChevronDown, CheckCircle, Clock, Hash, Save, Loader2 } from 'lucide-react';
import { ChatWindow } from '@/components/chat/ChatModal';
import { Button } from '@/components/ui/button';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentProgressCard } from './StudentProgressCard';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateStudentSection } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
  id: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  institutionId?: string;
  grade?: string;
  section?: string;
};

type AcademicPrediction = {
    prediction?: string;
};

type PsychologicalPrediction = {
    result?: string;
};

function StudentSectionForm({ studentId, currentSection }: { studentId: string; currentSection?: string }) {
    const [section, setSection] = useState(currentSection || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const { toast } = useToast();
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setSection(currentSection || '');
    }, [currentSection]);

    const handleSave = async (newSection: string) => {
        setIsSaving(true);
        setIsSaved(false);
        const result = await updateStudentSection(studentId, newSection);
        if (result.success) {
            toast({
                title: 'Sección actualizada',
                description: `El estudiante ha sido asignado a la sección ${newSection}.`,
            });
            setIsSaved(true);
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.message || 'No se pudo actualizar la sección.',
            });
        }
        setIsSaving(false);
         // Hide the saved checkmark after a delay
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSectionValue = e.target.value.toUpperCase();
        setSection(newSectionValue);
        
        // Clear previous debounce timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        // Set a new timeout to save after 1.5 seconds of inactivity
        debounceTimeout.current = setTimeout(() => {
            if (newSectionValue.trim() !== (currentSection || '')) {
                handleSave(newSectionValue.trim());
            }
        }, 1500);
    };

    return (
        <div className="relative max-w-xs">
            <Label htmlFor={`section-${studentId}`} className="flex items-center gap-2 mb-1 text-xs">
                <Hash className="h-3 w-3" /> Sección
            </Label>
            <Input
                id={`section-${studentId}`}
                value={section}
                onChange={handleSectionChange}
                placeholder="Ej: A, B, C..."
                className="pr-10"
                maxLength={10}
            />
            <div className="absolute top-7 right-2 h-6 w-6 flex items-center justify-center">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                : isSaved ? <CheckCircle className="h-4 w-4 text-green-500" />
                : null}
            </div>
        </div>
    );
}

function StudentRow({ student }: { student: UserProfile }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const [selectedUserForChat, setSelectedUserForChat] = useState<UserProfile | null>(null);
    const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

    const academicRef = useMemo(() => doc(firestore, 'academic_prediction', student.id), [firestore, student.id]);
    const psychRef = useMemo(() => doc(firestore, 'psychological_predictions', student.id), [firestore, student.id]);

    const { data: academicPrediction, isLoading: isLoadingAcademic } = useDoc<AcademicPrediction>(academicRef);
    const { data: psychPrediction, isLoading: isLoadingPsych } = useDoc<PsychologicalPrediction>(psychRef);

    const getInitials = (name?: string | null) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
    };

    const toggleStudentDetails = (studentId: string) => {
        setExpandedStudentId(prevId => (prevId === studentId ? null : studentId));
    };
    
    return (
        <>
            <motion.div
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
                        <div className="font-semibold flex items-center gap-2">
                            {student.username}
                            {student.grade && <Badge variant="outline">{student.grade}</Badge>}
                            {student.section && <Badge variant="secondary">{student.section}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {student.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    {isLoadingAcademic ? <Skeleton className="h-5 w-5 rounded-full" /> : academicPrediction?.prediction ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
                                </TooltipTrigger>
                                <TooltipContent>Test Académico {academicPrediction?.prediction ? 'Completado' : 'Pendiente'}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger>
                                    {isLoadingPsych ? <Skeleton className="h-5 w-5 rounded-full" /> : psychPrediction?.result ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
                                </TooltipTrigger>
                                <TooltipContent>Test Psicológico {psychPrediction?.result ? 'Completado' : 'Pendiente'}</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

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
                            <div className="p-4 border-t space-y-4">
                                <StudentSectionForm studentId={student.id} currentSection={student.section} />
                                <StudentProgressCard studentId={student.id} studentName={student.username} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
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


export default function StudentsList() {
    const { user } = useUser();
    const firestore = useFirestore();
    
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
                       <StudentRow key={student.id} student={student} />
                    ))}
                </div>
            ) : (
                 <p className="text-muted-foreground text-center py-8">
                    Aún no hay estudiantes registrados en tu institución.
                </p>
            )}
        </>
    );
}
