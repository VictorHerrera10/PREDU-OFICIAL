'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Copy, GraduationCap, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type Institution = {
  id: string;
  name: string;
  logoUrl?: string;
  uniqueCode: string;
  studentLimit: number;
  tutorLimit: number;
};

type UserProfile = {
    id: string;
    institutionId?: string;
};

export function InstitutionHeader() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const institutionRef = useMemo(() => {
        if (!userProfile?.institutionId || !firestore) return null;
        return doc(firestore, 'institutions', userProfile.institutionId);
    }, [userProfile, firestore]);

    const { data: institution, isLoading: isInstitutionLoading } = useDoc<Institution>(institutionRef);

    const studentsQuery = useMemo(() => {
        if (!institution?.id || !firestore) return null;
        return query(collection(firestore, 'users'), where('institutionId', '==', institution.id), where('role', '==', 'student'));
    }, [institution, firestore]);

    const tutorsQuery = useMemo(() => {
        if (!institution?.id || !firestore) return null;
        return query(collection(firestore, 'users'), where('institutionId', '==', institution.id), where('role', '==', 'tutor'));
    }, [institution, firestore]);

    const { data: students } = useCollection(studentsQuery);
    const { data: tutors } = useCollection(tutorsQuery);


    const isLoading = isProfileLoading || isInstitutionLoading;

    const handleCopyCode = () => {
        if (institution?.uniqueCode) {
            navigator.clipboard.writeText(institution.uniqueCode);
            toast({
                title: '¡Copiado!',
                description: 'El código del colegio ha sido copiado.',
            });
        }
    };

    if (!userProfile?.institutionId && !isLoading) return null;

    if (isLoading) {
        return <Skeleton className="h-8 w-full" />;
    }

    if (!institution) return null;

    return (
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground w-full">
            <div className='flex items-center gap-4'>
                <h2 className="font-semibold text-foreground text-lg">
                    <span className="text-muted-foreground font-normal text-base mr-2">🏫 Estás en:</span>
                    {institution.name}
                </h2>
                <div className="flex items-center gap-1.5">
                    <code className="bg-muted px-2 py-1 rounded text-primary font-bold">{institution.uniqueCode}</code>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyCode}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Copiar código de colegio</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
            <div className='flex items-center gap-4 text-xs font-medium'>
                <div className='flex items-center gap-1.5'>
                    <GraduationCap className="h-4 w-4" />
                    <span>Estudiantes: {students?.length || 0} / {institution.studentLimit}</span>
                </div>
                 <div className='flex items-center gap-1.5'>
                    <Users className="h-4 w-4" />
                    <span>Tutores: {tutors?.length || 0} / {institution.tutorLimit}</span>
                </div>
            </div>
        </div>
    );
}
