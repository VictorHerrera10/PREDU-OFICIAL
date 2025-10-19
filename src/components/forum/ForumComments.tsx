'use client';

import { useMemo, useRef } from 'react';
import { useCollection, useUser, useDoc, useFirestore } from '@/firebase';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '../ui/separator';
import { ForumComment, ForumCommentType } from './ForumComment';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Loader2, Send, Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useActionState } from 'react';
import { createForumComment } from '@/app/actions';
import { UserProfile } from './ForumView';

type ForumCommentsProps = {
  postId: string;
};

const EMOJIS = ['👍', '😂', '❤️', '🙏', '🔥', '🚀', '🤔', '🎉', '👋', '💯', '✅', '💡'];

const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
};

export function ForumComments({ postId }: ForumCommentsProps) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [state, formAction, isPending] = useActionState(createForumComment, { success: false, message: null });
    const formRef = useRef<HTMLFormElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);
    const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

    const commentsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'forums', postId, 'comments'), orderBy('createdAt', 'asc'));
    }, [firestore, postId]);
    
    const { data: comments, isLoading } = useCollection<ForumCommentType>(commentsQuery);
    
    if (state.success) {
        formRef.current?.reset();
    }
    
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


  return (
    <div className="bg-background/40 px-6 py-4 border-t">
        <Separator className="mb-4" />
        <div className="space-y-4">
            {isLoading && <Loader2 className="mx-auto my-4 h-6 w-6 animate-spin text-primary" />}
            
            <AnimatePresence>
                {comments && comments.map((comment, index) => (
                    <ForumComment key={comment.id} comment={comment} index={index} />
                ))}
            </AnimatePresence>
            
            {!isLoading && comments?.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">Sé el primero en comentar.</p>
            )}

             {user && userProfile && (
                <form ref={formRef} action={formAction} className="flex items-start gap-3 pt-4">
                     <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile.profilePictureUrl || undefined} />
                        <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                    </Avatar>
                    <div className="w-full space-y-2">
                        <input type="hidden" name="postId" value={postId} />
                        <input type="hidden" name="authorId" value={user.uid} />
                        <input type="hidden" name="authorName" value={userProfile.username || ''} />
                        <input type="hidden" name="authorRole" value={userProfile.role || ''} />
                        <input type="hidden" name="authorProfilePictureUrl" value={userProfile.profilePictureUrl || ''} />
                        <Textarea
                            ref={textAreaRef}
                            name="content"
                            placeholder="Añade un comentario..."
                            rows={1}
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
                                            <Button key={emoji} variant="ghost" size="icon" onClick={() => handleEmojiClick(emoji)} className="text-xl">{emoji}</Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Button type="submit" disabled={isPending} className="btn-retro !h-9 !px-3 !text-xs">
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                {isPending ? 'Enviando...' : 'Enviar'}
                            </Button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    </div>
  );
}
