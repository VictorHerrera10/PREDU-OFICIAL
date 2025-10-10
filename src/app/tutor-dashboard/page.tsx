'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { TutorProfileForm } from './tutor-profile-form';
import { TutorMainDashboard } from './tutor-main-dashboard';
import { TutorAdminLoader } from '@/components/tutor-admin-loader';

type UserProfile = {
    id: string;
    username: string;
    email: string;
    isProfileComplete?: boolean;
};

function TutorDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    if (isUserLoading || isProfileLoading) {
        return <TutorAdminLoader loadingText="Cargando tu perfil de tutor..." />;
    }

    if (userProfile && !userProfile.isProfileComplete) {
        return <TutorProfileForm user={user} />;
    }

    if (userProfile && userProfile.isProfileComplete) {
        return <TutorMainDashboard user={user} />;
    }
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
             <p className="text-muted-foreground">No se pudo cargar el perfil del tutor.</p>
        </div>
    );
}

export default TutorDashboardPage;
