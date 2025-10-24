'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { CreatePostForm } from './CreatePostForm';
import { ForumPostCard, ForumPost } from './ForumPostCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Files, Megaphone, Users, Award } from 'lucide-react';
import { Separator } from '../ui/separator';

export type UserProfile = {
  id: string;
  username: string;
  role: 'student' | 'tutor' | 'admin';
  institutionId?: string;
  profilePictureUrl?: string;
  isHero?: boolean;
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

  // Determine the association ID. Admins pass it via prop.
  // For students, it's either their institution ID, or the global hero forum if they are a hero and have no institution.
  const associationId = useMemo(() => {
    if (propAssociationId) return propAssociationId;
    if (userProfile?.institutionId) return userProfile.institutionId;
    if (userProfile?.isHero) return 'hero_students_forum';
    return null;
  }, [propAssociationId, userProfile]);
  

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

  if (!associationId && userProfile?.role === 'student' && !userProfile.isHero) {
      return (
           <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                <Files className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold">Foro de la Comunidad</h3>
                <p>Vincula tu cuenta a una institución o grupo para acceder al foro.</p>
            </div>
      )
  }

  if (!user || !userProfile || !associationId) {
    return null; // Don't render anything if there's no user or association context
  }

  // To allow admin to post in any forum, we pass the currently viewed associationId
  const profileForPosting = { ...userProfile, institutionId: associationId };
  
  const getForumTitle = () => {
    if (associationId === 'hero_students_forum') {
        return {
            title: "Anuncios para Héroes",
            icon: <Award className="h-6 w-6 text-destructive"/>
        };
    }
     return {
        title: "Foro de la Comunidad",
        icon: <Users className="h-6 w-6 text-primary"/>
    };
  }

  const { title, icon } = getForumTitle();


  return (
    <div className="space-y-8">
      {userProfile.role !== 'student' && <CreatePostForm user={user} userProfile={profileForPosting} />}
      
      {announcementPosts.length > 0 && (
         <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Megaphone className="h-6 w-6 text-amber-400"/>
                <h3 className="text-xl font-bold text-amber-400">Avisos Importantes</h3>
            </div>
            {arePostsLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : (
            announcementPosts.map((post, index) => (
                <ForumPostCard key={post.id} post={post} index={index} />
            ))
            )}
        </div>
      )}

       <div className="space-y-4 pt-6">
        {announcementPosts.length > 0 && <Separator />}
        <div className="flex items-center gap-3">
            {icon}
             <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>
        {arePostsLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        ) : communityPosts.length > 0 ? (
          communityPosts.map((post, index) => (
            <ForumPostCard key={post.id} post={post} index={index} />
          ))
        ) : (
             <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                <h3 className="font-semibold">{announcementPosts.length > 0 ? 'Aún no hay publicaciones en la comunidad.' : '¡Este foro está muy tranquilo!'}</h3>
                <p>Sé el primero en iniciar una conversación.</p>
            </div>
        )}
      </div>
    </div>
  );
}
