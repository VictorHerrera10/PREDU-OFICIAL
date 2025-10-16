'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { updateInstitution } from '@/app/actions';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Building, Save, Users, Mail, Phone, Briefcase, Copy, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type Institution = {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  region: string;
  level: string;
  studentLimit: number;
  tutorLimit: number;
  directorName: string;
  directorEmail: string;
  directorPhone?: string;
  teachingModality: string;
  logoUrl?: string;
  uniqueCode: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

type UserProfile = {
    id: string;
    username: string;
    email: string;
    tutorDetails?: {
        roleInInstitution: string;
    };
};


function TutorsList({ institutionId }: { institutionId: string }) {
    const firestore = useFirestore();

    const tutorsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'users'), 
            where('institutionId', '==', institutionId),
            where('role', '==', 'tutor')
        );
    }, [firestore, institutionId]);

    const { data: tutors, isLoading } = useCollection<UserProfile>(tutorsQuery);

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }
    
    if (!tutors || tutors.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No hay tutores registrados para esta institución.</p>
    }

    return (
        <div className="space-y-3">
            {tutors.map(tutor => (
                <div key={tutor.id} className="flex items-center gap-4 p-3 border rounded-lg bg-background/50">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${tutor.username}`} />
                        <AvatarFallback>{tutor.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-semibold">{tutor.username}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {tutor.email}</p>
                    </div>
                    {tutor.tutorDetails?.roleInInstitution && (
                         <Badge variant="secondary" className="flex items-center gap-1.5">
                            <Briefcase className="h-3 w-3"/>
                            {tutor.tutorDetails.roleInInstitution}
                        </Badge>
                    )}
                </div>
            ))}
        </div>
    );
}

function StudentsList({ institutionId }: { institutionId: string }) {
    const firestore = useFirestore();

    const studentsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'users'), 
            where('institutionId', '==', institutionId),
            where('role', '==', 'student')
        );
    }, [firestore, institutionId]);

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
        return <p className="text-sm text-muted-foreground text-center py-4">No hay estudiantes registrados para esta institución.</p>
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

export default function InstitutionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const institutionId = params.institutionId as string;

  const [isProcessing, setIsProcessing] = useState(false);

  const institutionRef = useMemo(() => {
    if (!firestore || !institutionId) return null;
    return doc(firestore, 'institutions', institutionId);
  }, [firestore, institutionId]);

  const { data: institution, isLoading } = useDoc<Institution>(institutionRef);

  const handleUpdate = async (formData: FormData) => {
    if (!institution) return;
    setIsProcessing(true);
    const result = await updateInstitution(institution.id, formData);
    if (result.success) {
      toast({
        title: 'Institución Actualizada ✅',
        description: `Los datos de "${result.name}" han sido actualizados.`,
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
    return <InstitutionDetailsSkeleton />;
  }

  if (!institution) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Building className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Institución no encontrada</h2>
        <p className="text-muted-foreground">
          No pudimos encontrar los datos de esta institución. Es posible que haya sido eliminada.
        </p>
        <Button asChild className="mt-6">
          <Link href="/admin/institutions">
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
                  <Building />
                  Detalles de la Institución
                </CardTitle>
                <CardDescription>
                  Revisa y edita la información de {institution.name}.
                </CardDescription>
                 <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">Código Único:</span>
                    <code className="bg-muted px-2 py-1 rounded text-primary font-bold">{institution.uniqueCode}</code>
                     <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6" 
                            onClick={() => handleCopyCode(institution.uniqueCode)}
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
                <Link href="/admin/institutions">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[65vh]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">
                
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* General Info */}
                    <div className="space-y-4 p-4 border rounded-lg bg-background/50">
                        <h3 className="font-semibold text-lg text-primary">Información General</h3>
                        <div className="space-y-2">
                            <Label htmlFor="name">🏫 Nombre de la Institución</Label>
                            <Input id="name" name="name" defaultValue={institution.name || ''} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address">🗺️ Dirección Completa</Label>
                            <Input id="address" name="address" defaultValue={institution.address || ''} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">📧 Email de Contacto General</Label>
                            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={institution.contactEmail || ''} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="logoUrl">🖼️ URL del Logo (Opcional)</Label>
                            <Input id="logoUrl" name="logoUrl" defaultValue={institution.logoUrl || ''} />
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div className="space-y-4 p-4 border rounded-lg bg-background/50">
                        <h3 className="font-semibold text-lg text-primary">Información Académica</h3>
                        <div className="space-y-2">
                            <Label htmlFor="region">📍 Región</Label>
                            <Select name="region" defaultValue={institution.region}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="norte">Norte</SelectItem><SelectItem value="centro">Centro</SelectItem><SelectItem value="sur">Sur</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="level">📚 Nivel</Label>
                            <Select name="level" defaultValue={institution.level}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="primaria">Primaria</SelectItem><SelectItem value="secundaria">Secundaria</SelectItem><SelectItem value="superior">Superior</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="teachingModality">👨‍🏫 Modalidad de Enseñanza</Label>
                            <Select name="teachingModality" defaultValue={institution.teachingModality}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="presencial">Presencial</SelectItem><SelectItem value="virtual">Virtual</SelectItem><SelectItem value="hibrida">Híbrida</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="studentLimit">🧑‍🎓 Límite de Estudiantes</Label>
                            <Input id="studentLimit" name="studentLimit" type="number" defaultValue={institution.studentLimit || 0} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tutorLimit">🧑‍🏫 Límite de Tutores</Label>
                            <Input id="tutorLimit" name="tutorLimit" type="number" defaultValue={institution.tutorLimit || 0} required />
                        </div>
                    </div>

                    {/* Director Info */}
                    <div className="space-y-4 p-4 border rounded-lg bg-background/50 md:col-span-2">
                        <h3 className="font-semibold text-lg text-primary">Información del Director</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="directorName">👤 Nombre del Director</Label>
                                <Input id="directorName" name="directorName" defaultValue={institution.directorName || ''} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="directorEmail">✉️ Email del Director</Label>
                                <Input id="directorEmail" name="directorEmail" type="email" defaultValue={institution.directorEmail || ''} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="directorPhone">📞 Teléfono del Director (Opcional)</Label>
                                <Input id="directorPhone" name="directorPhone" defaultValue={institution.directorPhone || ''} />
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Users List */}
                <div className="space-y-6 p-4 border rounded-lg bg-background/50">
                    <div>
                        <h3 className="font-semibold text-lg text-primary flex items-center gap-2 mb-4">
                            <Users /> Tutores Registrados
                        </h3>
                        <TutorsList institutionId={institutionId} />
                    </div>
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-lg text-primary flex items-center gap-2 mb-4">
                           <GraduationCap /> Estudiantes Registrados
                        </h3>
                        <StudentsList institutionId={institutionId} />
                    </div>
                </div>

                </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isProcessing}>
              <Save className="mr-2 h-4 w-4" />
              {isProcessing ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

function InstitutionDetailsSkeleton() {
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
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-4 p-4 border rounded-lg bg-background/50">
                             <Skeleton className="h-6 w-40 mb-4" />
                             <div className="space-y-4">
                                 <Skeleton className="h-5 w-32" />
                                 <Skeleton className="h-10 w-full" />
                                 <Skeleton className="h-5 w-32" />
                                 <Skeleton className="h-10 w-full" />
                             </div>
                         </div>
                          <div className="space-y-4 p-4 border rounded-lg bg-background/50">
                             <Skeleton className="h-6 w-40 mb-4" />
                             <div className="space-y-4">
                                 <Skeleton className="h-5 w-32" />
                                 <Skeleton className="h-10 w-full" />
                                 <Skeleton className="h-5 w-32" />
                                 <Skeleton className="h-10 w-full" />
                             </div>
                         </div>
                     </div>
                </CardContent>
                 <CardFooter className="flex justify-end">
                    <Skeleton className="h-10 w-36" />
                </CardFooter>
            </Card>
        </div>
    )
}

    
