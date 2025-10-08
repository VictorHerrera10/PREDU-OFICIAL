'use client';

import { useActionState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { updateTutorProfile } from '@/app/actions';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type UserProfile = {
    firstName?: string;
    lastName?: string;
    dni?: string;
    phone?: string;
    workArea?: string;
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

export function TutorProfileForm({ user, profileData }: Props) {
    const { toast } = useToast();
    const router = useRouter();
    const [state, formAction] = useActionState(updateTutorProfile, initialState);
    const isEditing = !!profileData?.firstName;

    useEffect(() => {
        if(state.success){
            toast({
                title: '¡Perfil de Tutor Actualizado! ✅',
                description: 'Tus datos han sido guardados correctamente.',
            });
            if (!isEditing) {
                router.refresh(); 
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
            <Card className="relative w-full max-w-3xl bg-card/80 backdrop-blur-sm border-border">
                {isEditing && (
                    <Button variant="ghost" size="icon" asChild className="absolute top-4 right-4 z-10">
                        <Link href="/tutor-dashboard">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Cerrar</span>
                        </Link>
                    </Button>
                )}
                <CardHeader className="text-center items-center">
                    <div className="flex justify-center mb-4 pt-8">
                         <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src={profileData?.profilePictureUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.displayName}`} alt={user?.displayName || 'Avatar'} />
                            <AvatarFallback><Briefcase className="w-12 h-12" /></AvatarFallback>
                        </Avatar>
                    </div>
                    <CardTitle className="text-3xl font-bold text-primary">
                         {isEditing ? 'Edita tu Perfil de Tutor' : `¡Bienvenido, Tutor ${user?.displayName || ''}!`}
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-2">
                        {isEditing ? 'Actualiza tu información profesional.' : 'Completa tu perfil para acceder a tus herramientas.'}
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
                            <Label htmlFor="dni">DNI</Label>
                            <Input id="dni" name="dni" type="text" placeholder="Tu número de DNI" defaultValue={profileData?.dni} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" name="phone" placeholder="987654321" defaultValue={profileData?.phone} required />
                        </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="email">Email (no editable)</Label>
                            <Input id="email" name="email" type="email" value={user?.email || ''} readOnly disabled />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="workArea">Área de Trabajo</Label>
                            <Input id="workArea" name="workArea" placeholder="Ej: Psicología Educativa" defaultValue={profileData?.workArea} required />
                        </div>

                        <div className="md:col-span-2 text-center mt-4">
                            <SubmitButton className="w-full max-w-xs mx-auto">
                                Guardar Perfil
                            </SubmitButton>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
