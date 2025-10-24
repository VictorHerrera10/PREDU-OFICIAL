'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Pin, Paperclip, MoreHorizontal, Edit, Trash2, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ForumComments } from './ForumComments';
import Image from 'next/image';
import { useUser } from '@/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '../ui/button';
import { deleteForumPost, editForumPost } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';


export type ForumPost = {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorProfilePictureUrl?: string;
  associationId: string;
  isAnnouncement?: boolean;
  createdAt: { seconds: number; nanoseconds: number };
  editedAt?: { seconds: number; nanoseconds: number };
  commentCount: number;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
};

type ForumPostCardProps = {
  post: ForumPost;
  index?: number;
};

const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
};

const renderRoleBadge = (role: string | null) => {
    if (!role) return null;
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">👑 Admin</Badge>;
      case 'tutor':
        return <Badge variant="secondary">🧑‍🏫 Tutor</Badge>;
      case 'student':
        return <Badge>🧑‍🎓 Estudiante</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
};

export function ForumPostCard({ post, index = 0 }: ForumPostCardProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isProcessing, setIsProcessing] = useState(false);

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true, locale: es })
    : 'hace un momento';

  const isAuthor = user?.uid === post.authorId;
  const isPrivilegedPost = post.isAnnouncement;

  const handleDelete = async () => {
    setIsProcessing(true);
    const result = await deleteForumPost(post.id, post.authorId);
    if (result.success) {
      toast({ title: 'Publicación eliminada' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsProcessing(false);
  };
  
  const handleEdit = async () => {
    setIsProcessing(true);
    const result = await editForumPost(post.id, post.authorId, editedContent);
    if (result.success) {
        toast({ title: 'Publicación actualizada' });
        setIsEditing(false);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsProcessing(false);
  };

  return (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
    >
        <Card className={cn(
            "transition-all", 
            isPrivilegedPost 
                ? "bg-card border-2 border-primary/50 shadow-lg shadow-primary/10" 
                : "hover:border-primary/50 bg-card/50"
        )}>
            <CardHeader className="flex flex-row items-start gap-4 pb-2">
                <Avatar>
                    <AvatarImage src={post.authorProfilePictureUrl} />
                    <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
                </Avatar>
                <div className="w-full">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold">{post.authorName}</p>
                            {renderRoleBadge(post.authorRole)}
                        </div>
                         <div className="flex items-center">
                            {isPrivilegedPost && <Pin className="w-4 h-4 text-primary" />}
                             {isAuthor && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                            <Edit className="mr-2 h-4 w-4" /> Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                                     <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Enviar al Vacío Digital?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta publicación y sus comentarios se desintegrarán para siempre. ¡No hay botón de deshacer en este juego! 💀
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Mejor no...</AlertDialogCancel>
                                                    <AlertDialogAction 
                                                        onClick={handleDelete} 
                                                        disabled={isProcessing}
                                                        className={cn(buttonVariants({variant: 'destructive'}), "btn-retro")}
                                                    >
                                                        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
                                                        ¡Sí, al olvido!
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                     <p className="text-xs text-muted-foreground">
                        {timeAgo}
                        {post.editedAt && <span className="italic"> (editado)</span>}
                    </p>
                </div>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
                 {isEditing ? (
                    <div className="space-y-2">
                        <Textarea 
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="bg-input"
                            rows={3}
                        />
                         <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
                            <Button size="sm" onClick={handleEdit} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Send className="mr-2 h-4 w-4" />}
                                Guardar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {post.content && <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>}
                    
                        {post.imageUrl && (
                            <div className="mt-4 flex justify-center">
                                <Image src={post.imageUrl} alt="Imagen adjunta" width={250} height={150} className="rounded-md object-cover max-h-80 w-auto" />
                            </div>
                        )}
                        
                        {post.fileUrl && (
                            <a 
                                href={post.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="mt-4 flex items-center gap-2 p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                            >
                                <Paperclip className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium text-foreground truncate">{post.fileName || 'Ver archivo adjunto'}</span>
                            </a>
                        )}
                    </>
                )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2 text-muted-foreground text-sm pt-0">
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.commentCount || 0} comentarios</span>
                    </button>
            </CardFooter>
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                       <ForumComments postId={post.id} />
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    </motion.div>
  );
}
