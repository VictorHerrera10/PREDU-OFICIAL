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
import { Briefcase, VenetianMask, X, User as UserIcon, CaseSensitive, Hash, Phone, Mail, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type UserProfile = {
    firstName?: string;
    lastName?: string;
    dni?: string;
    phone?: string;
    workArea?: string;
    gender?: string;
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
            <Card className="relative w-full max-w-4xl bg-card/80 backdrop-blur-sm border-border">
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
                    <form action={formAction} className="space-y-6">
                        <input type="hidden" name="userId" value={user?.uid} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="flex items-center gap-2"><UserIcon className="w-4 h-4"/> Nombres</Label>
                                <Input id="firstName" name="firstName" placeholder="Tus nombres" defaultValue={profileData?.firstName} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="flex items-center gap-2"><CaseSensitive className="w-4 h-4"/> Apellidos</Label>
                                <Input id="lastName" name="lastName" placeholder="Tus apellidos" defaultValue={profileData?.lastName} required />
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="dni" className="flex items-center gap-2"><Hash className="w-4 h-4"/> DNI</Label>
                                <Input id="dni" name="dni" type="text" placeholder="Tu número de DNI" defaultValue={profileData?.dni} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4"/> Teléfono</Label>
                                <Input id="phone" name="phone" placeholder="987654321" defaultValue={profileData?.phone} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender" className="flex items-center gap-2"><VenetianMask className="w-4 h-4"/> Género</Label>
                                <Select name="gender" defaultValue={profileData?.gender} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona tu género" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="masculino">Masculino</SelectItem>
                                        <SelectItem value="femenino">Femenino</SelectItem>
                                        <SelectItem value="otro">Otro</SelectItem>
                                        <SelectItem value="prefiero no decirlo">Prefiero no decirlo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                           <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4"/> Email (no editable)</Label>
                           <Input id="email" name="email" type="email" value={user?.email || ''} readOnly disabled />
                       </div>

                       <div className="space-y-2">
                            <Label htmlFor="workArea" className="flex items-center gap-2"><GraduationCap className="w-4 h-4"/> Área de Trabajo</Label>
                             <Select name="workArea" defaultValue={profileData?.workArea} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu área de trabajo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Municipalidad">Municipalidad</SelectItem>
                                    <SelectItem value="Unidad de Gestion Educativa Local">Unidad de Gestión Educativa Local</SelectItem>
                                    <SelectItem value="Dirección y Gestión Institucional">Dirección y Gestión Institucional</SelectItem>
                                    <SelectItem value="Académica o Pedagógica">Académica o Pedagógica</SelectItem>
                                    <SelectItem value="Psicopedagógica">Psicopedagógica</SelectItem>
                                    <SelectItem value="Administrativa">Administrativa</SelectItem>
                                </SelectContent>
                            </Select>
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
