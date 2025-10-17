'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building } from 'lucide-react';

type Institution = {
  id: string;
  name: string;
  logoUrl?: string;
};

type UserProfile = {
    institutionId?: string;
};

export function InstitutionHeader() {
    const { user } = useUser();
    const firestore = useFirestore();

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

    const isLoading = isProfileLoading || isInstitutionLoading;

    if (!userProfile?.institutionId && !isLoading) return null;

    if (isLoading) {
        return <Skeleton className="h-5 w-48" />;
    }

    if (!institution) return null;

    return (
         <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Avatar className="h-5 w-5 border">
                <AvatarImage src={institution.logoUrl} alt={institution.name} />
                <AvatarFallback>
                    <Building className="h-3 w-3" />
                </AvatarFallback>
            </Avatar>
            <span>{institution.name}</span>
        </div>
    );
}
