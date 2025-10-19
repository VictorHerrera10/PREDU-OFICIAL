'use client';

import { useMemo, useRef, useState } from 'react';
import { useCollection, useUser, useDoc, useFirestore, useStorage } from '@/firebase';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '../ui/separator';
import { ForumComment, ForumCommentType } from './ForumComment';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Loader2, Send, Smile, Paperclip, XCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { createForumComment } from '@/app/actions';
import { UserProfile } from './ForumView';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/storage';
import { Progress } from '../ui/progress';

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
    const storage = useStorage();
    const { toast } = useToast();

    const [isPending, setIsPending] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const formRef = useRef<HTMLFormElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
                toast({
                    variant: 'destructive',
                    title: 'Archivo demasiado grande',
                    description: 'Por favor, selecciona un archivo menor a 5MB.',
                });
                return;
            }
            setFile(selectedFile);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user || !userProfile) return;

        const formData = new FormData(e.currentTarget);
        const content = formData.get('content') as string;

        if (!content.trim() && !file) {
            toast({
                variant: 'destructive',
                title: 'Comentario vacío',
                description: 'Escribe un mensaje o adjunta un archivo.',
            });
            return;
        }

        setIsPending(true);
        let fileUrl: string | null = null;
        let fileName: string | null = null;
        let imageUrl: string | null = null;

        if (file && storage) {
            try {
                const filePath = `forum-attachments/${user.uid}/comments/${Date.now()}-${file.name}`;
                const downloadUrl = await uploadFile(storage, file, filePath, setUploadProgress);
                if (file.type.startsWith('image/')) {
                    imageUrl = downloadUrl;
                } else {
                    fileUrl = downloadUrl;
                    fileName = file.name;
                }
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Error al subir archivo',
                    description: 'No se pudo subir el archivo adjunto.',
                });
                setIsPending(false);
                setUploadProgress(0);
                return;
            }
        }
        
        const result = await createForumComment({
            postId,
            content,
            authorId: user.uid,
            authorName: userProfile.username || '',
            authorRole: userProfile.role || '',
            authorProfilePictureUrl: userProfile.profilePictureUrl || '',
            imageUrl,
            fileUrl,
            fileName,
        });

        setIsPending(false);
        setUploadProgress(0);

        if (result.success) {
            formRef.current?.reset();
            setFile(null);
        } else if (result.message) {
             toast({
                variant: 'destructive',
                title: 'Error al comentar',
                description: result.message,
            });
        }
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
                <form ref={formRef} onSubmit={handleSubmit} className="flex items-start gap-3 pt-4">
                     <Avatar className="h-8 w-8">
                        <AvatarImage src={userProfile.profilePictureUrl || undefined} />
                        <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                    </Avatar>
                    <div className="w-full space-y-2">
                        <input type="hidden" name="postId" value={postId} />
                        <Textarea
                            ref={textAreaRef}
                            name="content"
                            placeholder="Añade un comentario..."
                            rows={1}
                            className="bg-input"
                        />
                        {file && (
                            <div className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                                <span className="truncate text-muted-foreground">{file.name}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFile(null)}>
                                    <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        )}
                        {uploadProgress > 0 && (
                            <Progress value={uploadProgress} className="h-1" />
                        )}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
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
                                <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                                </Button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            </div>
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
