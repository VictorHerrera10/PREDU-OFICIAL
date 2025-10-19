'use client';

import { useActionState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createForumPost } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { SubmitButton } from '@/components/submit-button';
import { User } from 'firebase/auth';
import { UserProfile } from './ForumView'; // Assuming UserProfile is exported from ForumView
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MessageSquarePlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type CreatePostFormProps = {
  user: User;
  userProfile: UserProfile;
};

const initialState = {
  message: null,
  success: false,
};

export function CreatePostForm({ user, userProfile }: CreatePostFormProps) {
  const [state, formAction] = useActionState(createForumPost, initialState);
  const { toast } = useToast();
  
  if (state.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'Error al publicar',
        description: state.message,
      });
  }
  
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  };


  return (
    <Card className="bg-background/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
            <MessageSquarePlus />
            Crear una Nueva Publicación
        </CardTitle>
      </CardHeader>
      <CardContent>
         <form action={formAction} className="space-y-4">
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarImage src={userProfile.profilePictureUrl || undefined} />
                    <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                </Avatar>
                <div className="w-full space-y-2">
                    <input type="hidden" name="authorId" value={user.uid} />
                    <input type="hidden" name="authorName" value={userProfile.username || ''} />
                    <input type="hidden" name="authorRole" value={userProfile.role || ''} />
                    <input type="hidden" name="authorProfilePictureUrl" value={userProfile.profilePictureUrl || ''} />
                    <input type="hidden" name="associationId" value={userProfile.institutionId || ''} />
                    
                    <Textarea
                        name="content"
                        placeholder={`¿Qué quieres compartir con la comunidad, ${userProfile.username}?`}
                        rows={3}
                        required
                        className="bg-input"
                    />
                    <div className="flex justify-end">
                        <SubmitButton size="sm">Publicar</SubmitButton>
                    </div>
                </div>
            </div>
        </form>
      </CardContent>
    </Card>
  );
}
