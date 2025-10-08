'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { StudentProfileForm } from './student-profile-form';
import { StudentMainDashboard } from './student-main-dashboard';

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
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Cargando tu perfil...</p>
            </div>
        );
    }

    if (userProfile && !userProfile.isProfileComplete) {
        return <StudentProfileForm user={user} />;
    }

    if (userProfile && userProfile.isProfileComplete) {
        return <StudentMainDashboard user={user} />;
    }
    
    // Fallback or should not be reached if logic is correct
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
             <p className="text-muted-foreground">No se pudo cargar el perfil del estudiante.</p>
        </div>
    );
}

export default StudentDashboardPage;
