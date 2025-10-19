'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';

export type ForumCommentType = {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorProfilePictureUrl?: string;
  createdAt: { seconds: number; nanoseconds: number };
};

type ForumCommentProps = {
  comment: ForumCommentType;
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

export function ForumComment({ comment, index }: ForumCommentProps) {
  const timeAgo = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt.seconds * 1000), { addSuffix: true, locale: es })
    : 'hace un momento';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="flex items-start gap-3"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.authorProfilePictureUrl} />
        <AvatarFallback>{getInitials(comment.authorName)}</AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{comment.authorName}</span>
            {renderRoleBadge(comment.authorRole)}
             <span className="text-xs text-muted-foreground/80">{timeAgo}</span>
        </div>
        <p className="text-sm text-foreground/90 mt-1">{comment.content}</p>
      </div>
    </motion.div>
  );
}
