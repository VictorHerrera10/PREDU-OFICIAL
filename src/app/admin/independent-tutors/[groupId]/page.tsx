'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, UserCheck, Users, Mail, GraduationCap, Copy } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

type IndependentTutorGroup = {
  id: string;
  name: string;
  tutorName: string;
  tutorId: string;
  uniqueCode: string;
  studentLimit: number;
  tutorLimit: number;
  createdAt?: { seconds: number; nanoseconds: number };
};

type UserProfile = {
    id: string;
    username: string;
    email: string;
};


function StudentsList({ groupId }: { groupId: string }) {
    const firestore = useFirestore();

    // Students join an independent group by using its unique code.
    // We assume this code links them via 'institutionId' field on their user profile.
    const studentsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'users'), 
            where('institutionId', '==', groupId)
        );
    }, [firestore, groupId]);

    const { data: students, isLoading } = useCollection<UserProfile>(studentsQuery);

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }
    
    if (!students || students.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No hay estudiantes registrados en este grupo.</p>
    }

    return (
        <div className="space-y-3">
            {students.map(student => (
                <div key={student.id} className="flex items-center gap-4 p-3 border rounded-lg bg-background/50">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${student.username}`} />
                        <AvatarFallback>{student.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-semibold">{student.username}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {student.email}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const groupId = params.groupId as string;

  const groupRef = useMemo(() => {
    if (!firestore || !groupId) return null;
    return doc(firestore, 'independentTutorGroups', groupId);
  }, [firestore, groupId]);

  const { data: group, isLoading } = useDoc<IndependentTutorGroup>(groupRef);
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
        toast({
            title: '¡Copiado!',
            description: 'El código único ha sido copiado al portapapeles.',
        });
    }).catch(err => {
        console.error('Failed to copy: ', err);
        toast({
            variant: 'destructive',
            title: 'Error al copiar',
            description: 'No se pudo copiar el código.',
        });
    });
  };

  if (isLoading) {
    return <GroupDetailsSkeleton />;
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <UserCheck className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Grupo no encontrado</h2>
        <p className="text-muted-foreground">
          No pudimos encontrar los datos de este grupo. Es posible que haya sido eliminado.
        </p>
        <Button asChild className="mt-6">
          <Link href="/admin/independent-tutors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                  <UserCheck />
                  {group.name}
                </CardTitle>
                <CardDescription>
                  Tutor a cargo: {group.tutorName}
                </CardDescription>
                 <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">Código Único:</span>
                    <code className="bg-muted px-2 py-1 rounded text-primary font-bold">{group.uniqueCode}</code>
                     <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => handleCopyCode(group.uniqueCode)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copiar código</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/independent-tutors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-1 p-4 border rounded-lg bg-background/50 h-fit">
                     <h3 className="font-semibold text-lg text-primary mb-4">Límites</h3>
                     <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="h-5 w-5 text-muted-foreground" />
                            <span className="text-foreground">Límite de Estudiantes: <strong>{group.studentLimit}</strong></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-muted-foreground" />
                            <span className="text-foreground">Límite de Tutores: <strong>{group.tutorLimit}</strong></span>
                        </div>
                     </div>
                </Card>

                <Card className="lg:col-span-2 space-y-4 p-4 border rounded-lg bg-background/50">
                    <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                        <Users /> Estudiantes Registrados
                    </h3>
                    <ScrollArea className="h-64">
                        <StudentsList groupId={groupId} />
                    </ScrollArea>
                </Card>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}

function GroupDetailsSkeleton() {
    return (
        <div className="w-full mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <Skeleton className="h-8 w-72 mb-2" />
                            <Skeleton className="h-5 w-96" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="space-y-4 p-4 border rounded-lg bg-background/50">
                             <Skeleton className="h-6 w-40 mb-4" />
                             <div className="space-y-4">
                                 <Skeleton className="h-5 w-32" />
                                 <Skeleton className="h-10 w-full" />
                             </div>
                         </div>
                          <div className="md:col-span-2 space-y-4 p-4 border rounded-lg bg-background/50">
                             <Skeleton className="h-6 w-40 mb-4" />
                             <div className="space-y-4">
                                 <Skeleton className="h-16 w-full" />
                                 <Skeleton className="h-16 w-full" />
                             </div>
                         </div>
                     </div>
                </CardContent>
            </Card>
        </div>
    )
}
