'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { StudentProfileForm } from './student-profile-form';
import { StudentMainDashboard } from './student-main-dashboard';
import { StudentLoader } from '@/components/student-loader';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type UserProfile = {
    id: string;
    username: string;
    email: string;
    isProfileComplete?: boolean;
};

function StudentDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    if (isUserLoading || isProfileLoading) {
        return <StudentLoader loadingText="Cargando tu perfil..." />;
    }

    if (userProfile && !userProfile.isProfileComplete) {
        return <StudentProfileForm user={user} />;
    }

    if (userProfile && userProfile.isProfileComplete) {
        return <StudentMainDashboard user={user} />;
    }
    
    // Fallback or should not be reached if logic is correct
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 gap-4">
             <p className="text-muted-foreground">No se pudo cargar el perfil del estudiante.</p>
             <Button asChild variant="outline">
                <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Inicio
                </Link>
             </Button>
        </div>
    );
}

export default StudentDashboardPage;
