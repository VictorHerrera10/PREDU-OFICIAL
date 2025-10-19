'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
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

  // Query the entire forums collection, we will filter on the client.
  const forumQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'forums'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: allPosts, isLoading: arePostsLoading } = useCollection<ForumPost>(forumQuery);

  // Filter posts on the client side
  const filteredPosts = useMemo(() => {
    if (!allPosts || !userProfile?.institutionId) return [];
    return allPosts.filter(post => post.associationId === userProfile.institutionId);
  }, [allPosts, userProfile]);

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
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
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
