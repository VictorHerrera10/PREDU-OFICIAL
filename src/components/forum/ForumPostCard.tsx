'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Pin, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ForumComments } from './ForumComments';
import Image from 'next/image';


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
  const [showComments, setShowComments] = useState(false);

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt.seconds * 1000), { addSuffix: true, locale: es })
    : 'hace un momento';

  const isPrivilegedPost = post.isAnnouncement;

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
    >
        <Card className={cn(
            "transition-all", 
            isPrivilegedPost 
                ? "bg-card/90 border-2 border-primary/50 shadow-lg shadow-primary/10" 
                : "hover:border-primary/50 bg-card/50"
        )}>
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
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
                         {isPrivilegedPost && <Pin className="w-4 h-4 text-primary" />}
                    </div>
                     <p className="text-xs text-muted-foreground">{timeAgo}</p>
                </div>
            </CardHeader>
            <CardContent className="pt-2 pb-4">
                {post.content && <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>}
                
                {post.imageUrl && (
                    <div className="mt-4">
                        <Image src={post.imageUrl} alt="Imagen adjunta" width={500} height={300} className="rounded-md object-cover max-h-96 w-auto" />
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
