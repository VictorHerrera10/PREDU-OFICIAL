'use client';

import { useActionState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { updateStudentProfile } from '@/app/actions';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';


type UserProfile = {
    firstName?: string;
    lastName?: string;
    age?: number;
    grade?: string;
    city?: string;
    phone?: string;
    institutionId?: string;
    profilePictureUrl?: string;
};


type Props = {
    user: User | null;
    profileData?: UserProfile | null;
};

const initialState = {
    message: null,
    success: false,
};

export function StudentProfileForm({ user, profileData }: Props) {
    const { toast } = useToast();
    const router = useRouter();
    const [state, formAction] = useActionState(updateStudentProfile, initialState);
    const isEditing = !!profileData?.firstName;


    useEffect(() => {
        if(state.success){
            toast({
                title: '¡Perfil Actualizado! ✅',
                description: 'Tus datos han sido guardados correctamente.',
            });
            if (!isEditing) {
                router.refresh(); // Or redirect to dashboard
            }
        } else if (state.message) {
            toast({
                variant: 'destructive',
                title: 'Error al actualizar 😵',
                description: state.message,
            });
        }
    }, [state, toast, isEditing, router]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
             {isEditing && (
                <div className="absolute top-4 left-4">
                    <Button variant="ghost" asChild>
                        <Link href="/student-dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al Dashboard
                        </Link>
                    </Button>
                </div>
            )}
            <Card className="w-full max-w-3xl bg-card/80 backdrop-blur-sm border-border">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                         <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src={profileData?.profilePictureUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.displayName}`} alt={user?.displayName || 'Avatar'} />
                            <AvatarFallback><GraduationCap className="w-12 h-12" /></AvatarFallback>
                        </Avatar>
                    </div>
                    <CardTitle className="text-3xl font-bold text-primary">
                         {isEditing ? 'Edita tu Perfil' : `¡Casi listo, ${user?.displayName || 'Estudiante'}!`}
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-2">
                        {isEditing ? 'Actualiza tu información personal.' : 'Completa tu perfil para desbloquear todo tu potencial.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="hidden" name="userId" value={user?.uid} />
                        
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombres</Label>
                            <Input id="firstName" name="firstName" placeholder="Tus nombres" defaultValue={profileData?.firstName} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input id="lastName" name="lastName" placeholder="Tus apellidos" defaultValue={profileData?.lastName} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">Edad</Label>
                            <Input id="age" name="age" type="number" placeholder="Ej: 16" defaultValue={profileData?.age} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grado</Label>
                             <Select name="grade" defaultValue={profileData?.grade} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu grado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1ro Secundaria">1ro Secundaria</SelectItem>
                                    <SelectItem value="2do Secundaria">2do Secundaria</SelectItem>
                                    <SelectItem value="3ro Secundaria">3ro Secundaria</SelectItem>
                                    <SelectItem value="4to Secundaria">4to Secundaria</SelectItem>
                                    <SelectItem value="5to Secundaria">5to Secundaria</SelectItem>
                                    <SelectItem value="Egresado">Egresado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">Ciudad</Label>
                            <Input id="city" name="city" placeholder="Donde vives" defaultValue={profileData?.city} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" name="phone" placeholder="987654321" defaultValue={profileData?.phone} required />
                        </div>
                        <div className="space-y-2 md:col-span-1">
                            <Label htmlFor="institutionId">ID de Institución (Opcional)</Label>
                            <Input id="institutionId" name="institutionId" placeholder="Si tienes un código, ingrésalo aquí" defaultValue={profileData?.institutionId}/>
                        </div>

                        <div className="md:col-span-2 text-center mt-4">
                            <SubmitButton className="w-full max-w-xs mx-auto">
                                Guardar Cambios
                            </SubmitButton>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
