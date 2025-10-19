'use client';

import { useActionState, useRef, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { createForumPost } from '@/app/actions';
import { uploadFile } from '@/lib/storage';
import { Textarea } from '@/components/ui/textarea';
import { User } from 'firebase/auth';
import { UserProfile } from './ForumView';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MessageSquarePlus, Smile, Send, Loader2, Megaphone, Paperclip, XCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '../ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '../ui/label';
import { useStorage } from '@/firebase';
import { Progress } from '../ui/progress';

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
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const storage = useStorage();

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        // Limit file size to e.g. 5MB
        if (selectedFile.size > 5 * 1024 * 1024) {
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

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const content = formData.get('content') as string;

    if (!content.trim() && !file) {
        toast({
            variant: 'destructive',
            title: 'Publicación vacía',
            description: 'Escribe un mensaje o adjunta un archivo.',
        });
        setIsPending(false);
        return;
    }
    
    let fileUrl: string | null = null;
    let fileName: string | null = null;
    let imageUrl: string | null = null;

    if (file && storage) {
        try {
            const filePath = `forum-attachments/${user.uid}/${Date.now()}-${file.name}`;
            const downloadUrl = await uploadFile(storage, file, filePath, setUploadProgress);
            
            if(file.type.startsWith('image/')) {
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

    const result = await createForumPost(null, {
      content,
      authorId: user.uid,
      authorName: userProfile.username || '',
      authorRole: userProfile.role || '',
      authorProfilePictureUrl: userProfile.profilePictureUrl || '',
      associationId: userProfile.institutionId || '',
      isAnnouncement: isAnnouncement,
      imageUrl,
      fileUrl,
      fileName,
    });
    
    setIsPending(false);
    setUploadProgress(0);

    if (result.success) {
      toast({
        title: '¡Publicado!',
        description: 'Tu mensaje ya está en el foro.',
      });
      formRef.current?.reset();
      setFile(null);
      setIsAnnouncement(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al publicar',
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
         <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-4">
            <div className="flex items-start gap-4">
                <Avatar>
                    <AvatarImage src={userProfile.profilePictureUrl || undefined} />
                    <AvatarFallback>{getInitials(userProfile.username)}</AvatarFallback>
                </Avatar>
                <div className="w-full space-y-2">
                    <Textarea
                        ref={textAreaRef}
                        name="content"
                        placeholder={`¿Qué quieres compartir con la comunidad, ${userProfile.username}?`}
                        rows={3}
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
                        <Progress value={uploadProgress} className="h-2" />
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
                            <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                                <Paperclip className="h-5 w-5 text-muted-foreground" />
                            </Button>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                       </div>
                        
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
