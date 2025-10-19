'use client';

import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useUser } from '@/firebase';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button, buttonVariants } from '../ui/button';
import { MoreHorizontal, Edit, Trash2, Loader2, Send, Paperclip } from 'lucide-react';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../ui/alert-dialog';
import { deleteForumComment, editForumComment } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export type ForumCommentType = {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorProfilePictureUrl?: string;
  createdAt: { seconds: number; nanoseconds: number };
  editedAt?: { seconds: number; nanoseconds: number };
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
};

type ForumCommentProps = {
  comment: ForumCommentType;
  postId: string;
  index: number;
};

const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('');
};

const renderRoleBadge = (role: string | null) => {
    if (!role) return null;
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="text-xs">👑 Admin</Badge>;
      case 'tutor':
        return <Badge variant="secondary" className="text-xs">🧑‍🏫 Tutor</Badge>;
      case 'student':
        return <Badge className="text-xs">🧑‍🎓 Estudiante</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{role}</Badge>;
    }
};

export function ForumComment({ comment, postId, index }: ForumCommentProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isProcessing, setIsProcessing] = useState(false);

  const timeAgo = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true, locale: es })
    : 'hace un momento';
    
  const isAuthor = user?.uid === comment.authorId;

  const handleDelete = async () => {
    setIsProcessing(true);
    const result = await deleteForumComment(postId, comment.id, comment.authorId);
    if (!result.success) {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    } else {
        toast({ title: 'Comentario eliminado' });
    }
    setIsProcessing(false);
  };
  
  const handleEdit = async () => {
    setIsProcessing(true);
    const result = await editForumComment(postId, comment.id, comment.authorId, editedContent);
     if (result.success) {
        toast({ title: 'Comentario actualizado' });
        setIsEditing(false);
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsProcessing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-start gap-3 group"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.authorProfilePictureUrl} />
        <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow bg-muted/50 rounded-lg p-2">
        <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{comment.authorName}</span>
                {renderRoleBadge(comment.authorRole)}
                <span className="text-xs text-muted-foreground/80">{timeAgo} {comment.editedAt && '(editado)'}</span>
            </div>
             {isAuthor && (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                    <AlertDialogTitle>¿Confirmas la eliminación?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Este comentario será borrado permanentemente. Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={handleDelete} 
                                      disabled={isProcessing} 
                                      className={cn(buttonVariants({variant: 'destructive'}), "btn-retro")}
                                    >
                                       {isProcessing ? <Loader2 className="animate-spin mr-2" /> : null}
                                        Sí, eliminar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
         {isEditing ? (
             <div className="space-y-2 mt-1">
                <Textarea 
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="bg-input text-sm"
                    rows={2}
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
                <p className="text-sm text-foreground/90 mt-1">{comment.content}</p>
                {comment.imageUrl && (
                    <div className="mt-2">
                        <Image src={comment.imageUrl} alt="Imagen adjunta" width={150} height={100} className="rounded-md object-cover" />
                    </div>
                )}
                {comment.fileUrl && (
                    <a 
                        href={comment.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 flex items-center gap-2 text-xs p-1.5 bg-background/50 rounded-md hover:bg-background w-fit"
                    >
                        <Paperclip className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground truncate">{comment.fileName || 'Ver archivo'}</span>
                    </a>
                )}
            </>
        )}
      </div>
    </motion.div>
  );
}
