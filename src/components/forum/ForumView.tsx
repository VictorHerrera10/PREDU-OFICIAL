'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { CreatePostForm } from './CreatePostForm';
import { ForumPostCard, ForumPost } from './ForumPostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Files, Megaphone, Users } from 'lucide-react';
import { Separator } from '../ui/separator';

export type UserProfile = {
  id: string;
  username: string;
  role: 'student' | 'tutor' | 'admin';
  institutionId?: string;
  profilePictureUrl?: string;
};

// New prop to specify the association ID to display
type ForumViewProps = {
    associationId?: string;
};


export function ForumView({ associationId: propAssociationId }: ForumViewProps) {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  // Use the prop if provided, otherwise fall back to the user's profile
  const associationId = propAssociationId || userProfile?.institutionId;

  // Fetch all posts, we will filter on the client
  const forumQuery = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'forums'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: allPosts, isLoading: arePostsLoading } = useCollection<ForumPost>(forumQuery);
  
  const { communityPosts, announcementPosts } = useMemo(() => {
    if (!allPosts || !associationId) {
      return { communityPosts: [], announcementPosts: [] };
    }
    const myPosts = allPosts.filter(post => post.associationId === associationId);
    
    const announcements = myPosts.filter(post => post.isAnnouncement);
    const community = myPosts.filter(post => !post.isAnnouncement);

    return { communityPosts: community, announcementPosts: announcements };
  }, [allPosts, associationId]);

  const isLoading = isAuthLoading || isProfileLoading;
  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!associationId) {
      return (
           <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                <Files className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold">Foro de la Comunidad</h3>
                <p>Vincula tu cuenta a una institución o grupo para acceder al foro.</p>
            </div>
      )
  }

  if (!user || !userProfile) {
    return null;
  }

  // To allow admin to post in any forum, we pass the currently viewed associationId
  const profileForPosting = { ...userProfile, institutionId: associationId };

  return (
    <div className="space-y-8">
      <CreatePostForm user={user} userProfile={profileForPosting} />
      
      <div className="space-y-6">
         <div className="flex items-center gap-3">
             <Megaphone className="h-6 w-6 text-amber-400"/>
             <h3 className="text-xl font-bold text-amber-400">Avisos Importantes</h3>
         </div>
        {arePostsLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
            </div>
        ) : announcementPosts && announcementPosts.length > 0 ? (
          announcementPosts.map((post, index) => (
            <ForumPostCard key={post.id} post={post} index={index} />
          ))
        ) : (
            <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg border-amber-500/30">
                <h3 className="font-semibold">No hay avisos por ahora.</h3>
                <p>Aquí aparecerán las publicaciones de tus tutores y administradores.</p>
            </div>
        )}
      </div>

       <div className="space-y-4 pt-6">
        <Separator />
        <div className="flex items-center gap-3">
             <Users className="h-6 w-6 text-primary"/>
             <h3 className="text-xl font-bold text-foreground">Foro de la Comunidad</h3>
        </div>
        {arePostsLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        ) : communityPosts && communityPosts.length > 0 ? (
          communityPosts.map((post, index) => (
            <ForumPostCard key={post.id} post={post} index={index} />
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
