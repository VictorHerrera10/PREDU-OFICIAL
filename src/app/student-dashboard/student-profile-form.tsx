'use client';

import { useActionState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { updateStudentProfile } from '@/app/actions';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SubmitButton } from '@/components/submit-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap } from 'lucide-react';

type Props = {
    user: User | null;
};

const initialState = {
    message: null,
    success: false,
};

export function StudentProfileForm({ user }: Props) {
    const { toast } = useToast();
    const [state, formAction] = useActionState(updateStudentProfile, initialState);

    useEffect(() => {
        if (state.message && !state.success) {
            toast({
                variant: 'destructive',
                title: 'Error al actualizar 😵',
                description: state.message,
            });
        }
        // Success is handled by revalidation and re-rendering of the parent page
    }, [state, toast]);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="w-full max-w-3xl bg-card/80 backdrop-blur-sm border-border">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                         <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.displayName}`} alt={user?.displayName || 'Avatar'} />
                            <AvatarFallback><GraduationCap className="w-12 h-12" /></AvatarFallback>
                        </Avatar>
                    </div>
                    <CardTitle className="text-3xl font-bold text-primary">
                        ¡Casi listo, {user?.displayName || 'Estudiante'}!
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-2">
                        Completa tu perfil para desbloquear todo tu potencial.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input type="hidden" name="userId" value={user?.uid} />
                        
                        <div className="space-y-2">
                            <Label htmlFor="firstName">Nombres</Label>
                            <Input id="firstName" name="firstName" placeholder="Tus nombres" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input id="lastName" name="lastName" placeholder="Tus apellidos" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="age">Edad</Label>
                            <Input id="age" name="age" type="number" placeholder="Ej: 16" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grado</Label>
                             <Select name="grade" required>
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
                            <Input id="city" name="city" placeholder="Donde vives" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Teléfono</Label>
                            <Input id="phone" name="phone" placeholder="987654321" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="institutionCode">Código de Colegio (Opcional)</Label>
                            <Input id="institutionCode" name="institutionCode" placeholder="Si tienes un código, ingrésalo aquí" />
                        </div>

                        <div className="md:col-span-2 text-center mt-4">
                            <SubmitButton className="w-full max-w-xs mx-auto">
                                Guardar y Continuar
                            </SubmitButton>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
