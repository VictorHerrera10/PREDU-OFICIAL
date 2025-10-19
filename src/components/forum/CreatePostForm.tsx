'use client';

import { useActionState, useRef, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createForumPost } from '@/app/actions';
import { Textarea } from '@/components/ui/textarea';
import { User } from 'firebase/auth';
import { UserProfile } from './ForumView'; // Assuming UserProfile is exported from ForumView
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MessageSquarePlus, Smile, Send, Loader2, Megaphone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '../ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '../ui/label';

type CreatePostFormProps = {
  user: User;
  userProfile: UserProfile;
};

const initialState = {
  message: null,
  success: false,
};

const EMOJIS = ['👍', '😂', '❤️', '🙏', '🔥', '🚀', '🤔', '🎉', '👋', '💯', '✅', '💡'];

export function CreatePostForm({ user, userProfile }: CreatePostFormProps) {
  const [state, formAction, isPending] = useActionState(createForumPost, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [isAnnouncement, setIsAnnouncement] = useState(false);

  useEffect(() => {
    if (state.message) {
      if (!state.success) {
        toast({
          variant: 'destructive',
          title: 'Error al publicar',
          description: state.message,
        });
      } else {
        toast({
          title: '¡Publicado!',
          description: 'Tu mensaje ya está en el foro.',
        });
        formRef.current?.reset();
        setIsAnnouncement(false);
      }
    }
  }, [state, toast]);
  
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  };

  const handleEmojiClick = (emoji: string) => {
    if (textAreaRef.current) {
        const start = textAreaRef.current.selectionStart;
        const end = textAreaRef.current.selectionEnd;
        const text = textAreaRef.current.value;
        const newText = text.substring(0, start) + emoji + text.substring(end);
        
        const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
        nativeTextareaValueSetter?.call(textAreaRef.current, newText);

        const event = new Event('input', { bubbles: true });
        textAreaRef.current.dispatchEvent(event);

        setTimeout(() => {
            textAreaRef.current?.focus();
            textAreaRef.current?.setSelectionRange(start + emoji.length, start + emoji.length);
        }, 0);
    }
  };

  const isPrivilegedUser = userProfile.role === 'admin' || userProfile.role === 'tutor';

  return (
    <Card className="bg-background/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
            <MessageSquarePlus />
            Crear una Nueva Publicación
        </CardTitle>
      </CardHeader>
      <CardContent>
         <form ref={formRef} action={formAction} className="space-y-4">
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
                    <input type="hidden" name="isAnnouncement" value={String(isAnnouncement)} />
                    
                    <Textarea
                        ref={textAreaRef}
                        name="content"
                        placeholder={`¿Qué quieres compartir con la comunidad, ${userProfile.username}?`}
                        rows={3}
                        required
                        className="bg-input"
                    />
                    <div className="flex justify-between items-center">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="ghost" size="icon">
                                    <Smile className="h-5 w-5 text-muted-foreground" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                                <div className="grid grid-cols-6 gap-1">
                                    {EMOJIS.map(emoji => (
                                        <Button
                                            key={emoji}
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEmojiClick(emoji)}
                                            className="text-xl"
                                        >
                                            {emoji}
                                        </Button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                        
                        <div className="flex items-center gap-4">
                            {isPrivilegedUser && (
                                <div className="flex items-center space-x-2">
                                    <Switch 
                                        id="announcement-switch" 
                                        checked={isAnnouncement}
                                        onCheckedChange={setIsAnnouncement}
                                    />
                                    <Label htmlFor="announcement-switch" className="flex items-center gap-1.5 text-sm text-amber-400">
                                        <Megaphone className="h-4 w-4" />
                                        Aviso
                                    </Label>
                                </div>
                            )}
                            <Button type="submit" disabled={isPending} className="btn-retro !h-10 !px-4 !text-sm">
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                {isPending ? 'Publicando...' : 'Publicar'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
      </CardContent>
    </Card>
  );
}
