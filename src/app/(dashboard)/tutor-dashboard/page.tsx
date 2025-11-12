'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import { TutorProfileForm } from './tutor-profile-form';
import { TutorMainDashboard } from './tutor-main-dashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TutorAdminLoader } from '@/components/tutor-admin-loader';

type UserProfile = {
    id: string;
    username: string;
    email: string;
    isProfileComplete?: boolean;
    role?: 'student' | 'tutor' | 'admin';
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
    
    // Role validation
    if (userProfile && userProfile.role !== 'tutor') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
                 <h1 className="text-3xl font-bold text-destructive mb-4">¡Ups! Parece que tomaste un camino equivocado. 🤔</h1>
                 <p className="text-muted-foreground mb-8">
                     Esta área es exclusiva para tutores.
                 </p>
                 <Button asChild>
                    <Link href="/login">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Inicio
                    </Link>
                 </Button>
            </div>
        );
    }


    if (userProfile && !userProfile.isProfileComplete) {
        return <TutorProfileForm user={user} />;
    }

    if (userProfile && userProfile.isProfileComplete) {
        return <TutorMainDashboard user={user} />;
    }
    
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 gap-4">
             <p className="text-muted-foreground">No se pudo cargar el perfil del tutor.</p>
             <Button asChild variant="outline">
                <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Inicio de Sesión
                </Link>
             </Button>
        </div>
    );
}

export default TutorDashboardPage;
