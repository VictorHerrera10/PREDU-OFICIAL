'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { updateIndependentTutorGroup } from '@/app/actions';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, UserCheck, Users, Mail, GraduationCap, Copy, Save, Loader2, Briefcase, Phone, Hash, MapPin, FileText } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type IndependentTutorGroup = {
  id: string;
  name: string;
  tutorName: string;
  tutorId: string;
  uniqueCode: string;
  studentLimit?: number;
  tutorLimit?: number;
  region?: string;
  reasonForUse?: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

type UserProfile = {
    id: string;
    username: string;
    email: string;
    dni?: string;
    phone?: string;
    profilePictureUrl?: string;
};

type StudentProfile = UserProfile; // Alias for clarity


function StudentsList({ groupId }: { groupId: string }) {
    const firestore = useFirestore();

    const studentsQuery = useMemo(() => {
        if (!firestore) return null;
        // The groupId from URL corresponds to the document ID of the independentTutorGroups
        // which students are linked to via their `institutionId` field.
        return query(
            collection(firestore, 'users'), 
            where('institutionId', '==', groupId)
        );
    }, [firestore, groupId]);

    const { data: students, isLoading } = useCollection<StudentProfile>(studentsQuery);

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
                        <AvatarImage src={student.profilePictureUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${student.username}`} />
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

function TutorDetails({ tutorId }: { tutorId: string }) {
    const firestore = useFirestore();
    const tutorRef = useMemo(() => {
        if (!firestore || !tutorId) return null;
        return doc(firestore, 'users', tutorId);
    }, [firestore, tutorId]);

    const { data: tutor, isLoading } = useDoc<UserProfile>(tutorRef);

    if (isLoading) return <Skeleton className="h-28 w-full" />;
    if (!tutor) return <p className="text-sm text-muted-foreground">Tutor no encontrado.</p>;

    return (
        <div className="flex flex-col gap-4 p-3 border rounded-lg bg-background/50">
            <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                    <AvatarImage src={tutor.profilePictureUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${tutor.username}`} />
                    <AvatarFallback>{tutor.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold text-lg">{tutor.username}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {tutor.email}</p>
                </div>
            </div>
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Hash className="h-4 w-4 text-muted-foreground"/> DNI: <span className="font-mono text-foreground">{tutor.dni || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground"/> Teléfono: <span className="font-mono text-foreground">{tutor.phone || 'N/A'}</span></div>
            </div>
        </div>
    );
}

export default function GroupDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleUpdate = async (formData: FormData) => {
    if (!group) return;
    setIsProcessing(true);
    const result = await updateIndependentTutorGroup(group.id, formData);

    if (result.success) {
      toast({
        title: 'Grupo Actualizado ✅',
        description: `Los límites del grupo "${result.name}" han sido actualizados.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al Actualizar 😵',
        description: result.message,
      });
    }
    setIsProcessing(false);
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
      <form action={handleUpdate}>
        <Card className="bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                  <UserCheck />
                  {group.name}
                </CardTitle>
                <CardDescription>
                  Detalles del grupo, tutor creador y estudiantes registrados.
                </CardDescription>
                 <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm text-muted-foreground">Código:</span>
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
                     <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4"/>
                        Región: <span className="font-semibold text-foreground">{group.region || 'N/A'}</span>
                    </div>
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
                <div className="lg:col-span-1 space-y-4 h-fit">
                    <Card className="p-4 border rounded-lg bg-background/50 space-y-4">
                        <h3 className="font-semibold text-lg text-primary flex items-center gap-2"><Briefcase />Tutor Creador</h3>
                        <TutorDetails tutorId={group.tutorId} />
                    </Card>
                    
                     <Card className="p-4 border rounded-lg bg-background/50 space-y-4">
                        <h3 className="font-semibold text-lg text-primary">Límites y Configuración</h3>
                        <div className="space-y-3 text-sm">
                            <div className="space-y-2">
                                <Label htmlFor="studentLimit" className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-muted-foreground" />Límite de Estudiantes</Label>
                                <Input id="studentLimit" name="studentLimit" type="number" defaultValue={group.studentLimit || 0} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tutorLimit" className="flex items-center gap-2"><Users className="h-5 w-5 text-muted-foreground" />Límite de Tutores</Label>
                                <Input id="tutorLimit" name="tutorLimit" type="number" defaultValue={group.tutorLimit || 0} required />
                            </div>
                        </div>
                    </Card>
                    
                    {group.reasonForUse && (
                        <Card className="p-4 border rounded-lg bg-background/50 space-y-2">
                             <h3 className="font-semibold text-lg text-primary flex items-center gap-2"><FileText />Motivo de Uso</h3>
                             <p className="text-sm text-muted-foreground">{group.reasonForUse}</p>
                        </Card>
                    )}

                </div>

                <Card className="lg:col-span-2 space-y-4 p-4 border rounded-lg bg-background/50">
                    <h3 className="font-semibold text-lg text-primary flex items-center gap-2">
                        <Users /> Estudiantes Registrados
                    </h3>
                    <ScrollArea className="h-[34rem]">
                        <StudentsList groupId={groupId} />
                    </ScrollArea>
                </Card>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
             <Button type="submit" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {isProcessing ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </Card>
      </form>
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
