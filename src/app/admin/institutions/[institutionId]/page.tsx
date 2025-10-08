'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
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
import { ArrowLeft, Building, Save } from 'lucide-react';
import Link from 'next/link';

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
    <div className="w-full mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
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
                  Revisa y edita la información de {institution.name}. Código Único: <code className="bg-muted px-2 py-1 rounded text-primary">{institution.uniqueCode}</code>
                </CardDescription>
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
            <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                {/* General Info */}
                <div className="space-y-4 p-4 border rounded-lg bg-background/50">
                    <h3 className="font-semibold text-lg text-primary">Información General</h3>
                    <div className="space-y-2">
                        <Label htmlFor="name">🏫 Nombre de la Institución</Label>
                        <Input id="name" name="name" defaultValue={institution.name} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">🗺️ Dirección Completa</Label>
                        <Input id="address" name="address" defaultValue={institution.address} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactEmail">📧 Email de Contacto General</Label>
                        <Input id="contactEmail" name="contactEmail" type="email" defaultValue={institution.contactEmail} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="logoUrl">🖼️ URL del Logo (Opcional)</Label>
                        <Input id="logoUrl" name="logoUrl" defaultValue={institution.logoUrl} />
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
                        <Input id="studentLimit" name="studentLimit" type="number" defaultValue={institution.studentLimit} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tutorLimit">🧑‍🏫 Límite de Tutores</Label>
                        <Input id="tutorLimit" name="tutorLimit" type="number" defaultValue={institution.tutorLimit} required />
                    </div>
                </div>

                {/* Director Info */}
                <div className="space-y-4 p-4 border rounded-lg bg-background/50 md:col-span-2">
                    <h3 className="font-semibold text-lg text-primary">Información del Director</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="directorName">👤 Nombre del Director</Label>
                            <Input id="directorName" name="directorName" defaultValue={institution.directorName} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="directorEmail">✉️ Email del Director</Label>
                            <Input id="directorEmail" name="directorEmail" type="email" defaultValue={institution.directorEmail} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="directorPhone">📞 Teléfono del Director (Opcional)</Label>
                            <Input id="directorPhone" name="directorPhone" defaultValue={institution.directorPhone} />
                        </div>
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
        <div className="w-full mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
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
