'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

type IndependentTutorGroup = {
  id: string;
  name: string;
};

type UserProfile = {
    institutionId?: string;
};

export function GroupHeader() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const groupRef = useMemo(() => {
        if (!userProfile?.institutionId || !firestore) return null;
        // Attempt to fetch from independentTutorGroups
        return doc(firestore, 'independentTutorGroups', userProfile.institutionId);
    }, [userProfile, firestore]);

    const { data: group, isLoading: isGroupLoading } = useDoc<IndependentTutorGroup>(groupRef);

    const isLoading = isProfileLoading || isGroupLoading;

    // If it's loading or if no group was found (meaning it's an institution), render nothing.
    if (isLoading || !group) return null;

    return (
        <div className="w-full bg-background/80 backdrop-blur-sm border-b py-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border">
                        <AvatarFallback>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <h2 className="font-semibold text-foreground text-lg">
                        <span className="text-muted-foreground font-normal text-base mr-2">👥 Estás en</span>
                        {group.name}
                    </h2>
                </div>
            </div>
        </div>
    );
}
