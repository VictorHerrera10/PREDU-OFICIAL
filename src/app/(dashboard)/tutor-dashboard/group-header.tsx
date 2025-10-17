'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Copy } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type IndependentTutorGroup = {
  id: string;
  name: string;
  uniqueCode: string;
  tutorId: string;
};

export function GroupHeader() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const groupQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'independentTutorGroups'),
            where('tutorId', '==', user.uid),
            limit(1)
        );
    }, [user, firestore]);

    const { data: groups, isLoading } = useCollection<IndependentTutorGroup>(groupQuery);
    const group = groups?.[0];

    const handleCopyCode = () => {
        if (group?.uniqueCode) {
            navigator.clipboard.writeText(group.uniqueCode);
            toast({
                title: '¡Copiado!',
                description: 'El código de tu grupo ha sido copiado.',
            });
        }
    };
    
    if (isLoading) {
        return <Skeleton className="h-8 w-48" />;
    }

    if (!group) return null;

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 border rounded-lg">
             <Users className="h-4 w-4" />
             <span>{group.name}</span>
             <span className="text-muted-foreground/50">|</span>
             <div className="flex items-center gap-1">
                <code className="font-bold text-primary">{group.uniqueCode}</code>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyCode}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Copiar código de grupo</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
             </div>
        </div>
    );
}
