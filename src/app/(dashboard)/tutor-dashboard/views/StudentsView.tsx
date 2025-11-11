'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useUser, useFirestore, useCollection, useDoc } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, MessageSquare, ChevronDown, CheckCircle, Clock, Hash, Save, Loader2, BookOpen, Filter } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
                                <StudentProgressCard studentId={student.id} studentName={student.username} studentEmail={student.email} />
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
    
    const [gradeFilter, setGradeFilter] = useState('all');
    const [sectionFilter, setSectionFilter] = useState('all');

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
    
    const { uniqueGrades, uniqueSections, filteredStudents } = useMemo(() => {
        if (!students) return { uniqueGrades: [], uniqueSections: [], filteredStudents: [] };

        const grades = [...new Set(students.map(s => s.grade).filter(Boolean))].sort();
        const sections = [...new Set(students.map(s => s.section).filter(Boolean))].sort();
        
        const filtered = students.filter(student => {
            const gradeMatch = gradeFilter === 'all' || student.grade === gradeFilter;
            const sectionMatch = sectionFilter === 'all' || student.section === sectionFilter;
            return gradeMatch && sectionMatch;
        });

        return { uniqueGrades: grades, uniqueSections: sections, filteredStudents: filtered };
    }, [students, gradeFilter, sectionFilter]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }
    
    return (
        <>
             <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 border rounded-lg bg-background/30">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Filter className="h-5 w-5" />
                    Filtrar Estudiantes
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                    <div className="space-y-1">
                        <Label htmlFor="grade-filter" className="text-xs">Grado</Label>
                        <Select value={gradeFilter} onValueChange={setGradeFilter}>
                            <SelectTrigger id="grade-filter">
                                <SelectValue placeholder="Filtrar por grado..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los Grados</SelectItem>
                                {uniqueGrades.map(grade => (
                                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="section-filter" className="text-xs">Sección</Label>
                        <Select value={sectionFilter} onValueChange={setSectionFilter}>
                            <SelectTrigger id="section-filter">
                                <SelectValue placeholder="Filtrar por sección..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas las Secciones</SelectItem>
                                {uniqueSections.map(section => (
                                    <SelectItem key={section} value={section}>{section}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {filteredStudents && filteredStudents.length > 0 ? (
                <div className="space-y-3">
                    {filteredStudents.map(student => (
                       <StudentRow key={student.id} student={student} />
                    ))}
                </div>
            ) : (
                 <p className="text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                    {students && students.length > 0 ? 'No hay estudiantes que coincidan con los filtros seleccionados.' : 'Aún no hay estudiantes registrados en tu institución.'}
                </p>
            )}
        </>
    );
}
