'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, Users, Copy } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type IndependentTutorGroup = {
  id: string;
  name: string;
  uniqueCode: string;
  tutorId: string;
  studentLimit: number;
  tutorLimit: number;
};

export function GroupHeader() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const groupQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'independentTutorGroups'),
            where('tutorId', '==', user.uid),
            where('tutorId', '!=', null) // Ensure tutorId is not null
        );
    }, [user, firestore]);

    const { data: groups, isLoading } = useCollection<IndependentTutorGroup>(groupQuery);
    const group = groups?.[0];
    
    const studentsQuery = useMemo(() => {
        if (!group?.id || !firestore) return null;
        // Assuming students are linked via institutionId which holds the group id
        return query(collection(firestore, 'users'), where('institutionId', '==', group.id), where('role', '==', 'student'));
    }, [group, firestore]);

    const tutorsQuery = useMemo(() => {
        if (!group?.id || !firestore) return null;
        return query(collection(firestore, 'users'), where('institutionId', '==', group.id), where('role', '==', 'tutor'));
    }, [group, firestore]);

    const { data: students } = useCollection(studentsQuery);
    const { data: tutors } = useCollection(tutorsQuery);


    const handleCopyCode = () => {
        if (group?.uniqueCode) {
            navigator.clipboard.writeText(group.uniqueCode);
            toast({
                title: '¡Copiado!',
                description: 'El código de tu grupo ha sido copiado.',
            });
        }
    };
    
    if (isLoading) {
        return <Skeleton className="h-8 w-full" />;
    }

    if (!group) return null;

    return (
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground w-full">
            <div className='flex items-center gap-4'>
                <h2 className="font-semibold text-foreground text-lg">
                     <span className="text-muted-foreground font-normal text-base mr-2">👥 Grupo:</span>
                    {group.name}
                </h2>
                <div className="flex items-center gap-1.5">
                    <code className="bg-muted px-2 py-1 rounded text-primary font-bold">{group.uniqueCode}</code>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyCode}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copiar código de grupo</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
             <div className='flex items-center gap-4 text-xs font-medium'>
                <div className='flex items-center gap-1.5'>
                    <GraduationCap className="h-4 w-4" />
                    <span>Estudiantes: {students?.length || 0} / {group.studentLimit}</span>
                </div>
                 <div className='flex items-center gap-1.5'>
                    <Users className="h-4 w-4" />
                    <span>Tutores: {tutors?.length || 0} / {group.tutorLimit}</span>
                </div>
            </div>
        </div>
    );
}
