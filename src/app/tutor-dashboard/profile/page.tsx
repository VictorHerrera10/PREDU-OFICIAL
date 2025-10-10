'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { TutorProfileForm } from '../tutor-profile-form';
import { User } from 'firebase/auth';
import { TutorAdminLoader } from '@/components/tutor-admin-loader';

type UserProfile = {
    id: string;
    username: string;
    email: string;
    isProfileComplete?: boolean;
    firstName?: string;
    lastName?: string;
    dni?: string;
    phone?: string;
    institutionId?: string;
    tutorDetails?: {
        workArea?: string;
    };
    gender?: string;
};

function TutorProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    if (isUserLoading || isProfileLoading) {
        return <TutorAdminLoader loadingText="Cargando tu perfil..." />;
    }

    return <TutorProfileForm user={user as User} profileData={userProfile} />;
}

export default TutorProfilePage;
