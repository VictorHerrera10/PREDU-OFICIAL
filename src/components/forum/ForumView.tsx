'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import { CreatePostForm } from './CreatePostForm';
import { ForumPostCard, ForumPost } from './ForumPostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Files } from 'lucide-react';

export type UserProfile = {
  id: string;
  username: string;
  role: 'student' | 'tutor' | 'admin';
  institutionId?: string;
  profilePictureUrl?: string;
};

export function ForumView() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const forumQuery = useMemo(() => {
    // This is the critical change: The query is ONLY constructed when all conditions are met.
    // 1. Firestore is available.
    // 2. The user profile is NOT loading.
    // 3. The user profile exists and has an institutionId.
    if (firestore && !isProfileLoading && userProfile?.institutionId) {
        return query(
          collection(firestore, 'forums'),
          where('associationId', '==', userProfile.institutionId),
          orderBy('createdAt', 'desc')
        );
    }
    // In all other cases (loading, no profile, no institutionId), return null.
    // useCollection will wait until the query is not null.
    return null; 
  }, [firestore, userProfile, isProfileLoading]);

  const { data: posts, isLoading: arePostsLoading } = useCollection<ForumPost>(forumQuery);
  
  // The overall loading state now correctly waits for the profile to load first.
  const isLoading = isProfileLoading || (!!userProfile?.institutionId && arePostsLoading);
  
  if (isProfileLoading) {
    return (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  // If after loading, the user has no institutionId, show the message to join one.
  if (!userProfile?.institutionId) {
      return (
           <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                <Files className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold">Foro de la Comunidad</h3>
                <p>Vincula tu cuenta a una institución o grupo para acceder al foro.</p>
            </div>
      )
  }

  if (!user || !userProfile) {
    return (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <CreatePostForm user={user} userProfile={userProfile} />
      
      <div className="space-y-4">
        {arePostsLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        ) : posts && posts.length > 0 ? (
          posts.map(post => (
            <ForumPostCard key={post.id} post={post} />
          ))
        ) : (
            <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                <h3 className="font-semibold">¡Este foro está muy tranquilo!</h3>
                <p>Sé el primero en iniciar una conversación.</p>
            </div>
        )}
      </div>
    </div>
  );
}
