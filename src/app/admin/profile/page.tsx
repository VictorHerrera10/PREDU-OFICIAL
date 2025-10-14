'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { TutorAdminLoader } from '@/components/tutor-admin-loader';
import { AdminProfileForm } from './admin-profile-form';
import { User } from 'firebase/auth';

type UserProfile = {
    id: string;
    username: string;
    email: string;
    profilePictureUrl?: string;
};

function AdminProfilePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    if (isUserLoading || isProfileLoading) {
        return <TutorAdminLoader loadingText="Cargando tu perfil de administrador..." />;
    }

    return <AdminProfileForm user={user as User} profileData={userProfile} />;
}

export default AdminProfilePage;
