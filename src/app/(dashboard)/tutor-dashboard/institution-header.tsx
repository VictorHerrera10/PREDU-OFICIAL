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

    return (
        <div className="w-full bg-background/80 backdrop-blur-sm border-b py-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {isLoading ? (
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-6 w-48" />
                    </div>
                ) : institution ? (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                            <AvatarImage src={institution.logoUrl} alt={institution.name} />
                            <AvatarFallback>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="font-semibold text-foreground text-lg">
                            <span className="text-muted-foreground font-normal text-base mr-2">🏫 Estás en</span>
                            {institution.name}
                        </h2>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
