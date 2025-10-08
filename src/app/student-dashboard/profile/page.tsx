'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { StudentProfileForm } from '../student-profile-form';
import { User } from 'firebase/auth';

type UserProfile = {
    id: string;
    username: string;
    email: string;
    isProfileComplete?: boolean;
    // Add all other fields from the student profile form
    firstName?: string;
    lastName?: string;
    age?: number;
    grade?: string;
    city?: string;
    phone?: string;
    institutionId?: string;
};

function StudentProfilePage() {
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

    // We can pass the existing user profile data to the form to pre-fill it.
    // The form component needs to be adapted to accept this data.
    return <StudentProfileForm user={user as User} profileData={userProfile} />;
}

export default StudentProfilePage;
