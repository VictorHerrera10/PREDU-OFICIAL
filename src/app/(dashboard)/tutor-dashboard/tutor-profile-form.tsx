'use client';

import { useEffect, useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { updateTutorProfile } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useStorage } from '@/firebase';
import { uploadImage } from '@/lib/storage';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, VenetianMask, X, User as UserIcon, CaseSensitive, Hash, Phone, Mail, GraduationCap, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';

type UserProfile = {
    firstName?: string;
    lastName?: string;
    dni?: string;
    phone?: string;
    gender?: string;
    profilePictureUrl?: string;
    tutorDetails?: {
        workArea?: string;
    };
};

type Props = {
    user: User | null;
    profileData?: UserProfile | null;
};

export function TutorProfileForm({ user, profileData }: Props) {
    const { toast } = useToast();
    const router = useRouter();
    const storage = useStorage();

    const isEditing = !!profileData?.firstName;
    const [selectedGender, setSelectedGender] = useState(profileData?.gender);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(profileData?.profilePictureUrl || null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
        setIsSubmitting(true);
        
        const formData = new FormData(e.currentTarget);
        let uploadedImageUrl: string | null = profileData?.profilePictureUrl || null;

        if (imageFile && storage) {
            try {
                uploadedImageUrl = await uploadImage(storage, imageFile, user.uid, setUploadProgress);
                formData.set('profilePictureUrl', uploadedImageUrl);
            } catch (error) {
                console.error("Image upload failed:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error de Carga',
                    description: 'No se pudo subir la foto de perfil.',
                });
                setIsSubmitting(false);
                return;
            }
        } else if (uploadedImageUrl) {
            formData.set('profilePictureUrl', uploadedImageUrl);
        }
        
        const result = await updateTutorProfile(null, formData);

        if(result.success){
            toast({
                title: '¡Perfil de Tutor Actualizado! ✅',
                description: 'Tus datos han sido guardados correctamente.',
            });
            if (!isEditing) {
                router.refresh(); 
            }
        } else if (result.message) {
            toast({
                variant: 'destructive',
                title: 'Error al actualizar 😵',
                description: result.message,
            });
        }
        setIsSubmitting(false);
    };

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
                    <div className="relative flex justify-center mb-4 pt-8">
                         <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src={imagePreview || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.displayName}`} alt={user?.displayName || 'Avatar'} />
                            <AvatarFallback><Briefcase className="w-12 h-12" /></AvatarFallback>
                        </Avatar>
                        <Button asChild size="icon" variant="secondary" className="absolute -bottom-2 -right-2 h-8 w-8 border-2 border-background">
                            <Label htmlFor="photo-upload" className="cursor-pointer">
                                <Upload className="w-4 h-4" />
                                <span className="sr-only">Cambiar foto</span>
                            </Label>
                        </Button>
                        <Input id="photo-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={isSubmitting} />
                    </div>
                     {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full max-w-xs pt-2 mx-auto">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1 text-center">{`Subiendo... ${Math.round(uploadProgress)}%`}</p>
                        </div>
                    )}
                    <CardTitle className="text-3xl font-bold text-primary">
                         {isEditing ? 'Edita tu Perfil de Tutor' : `¡Bienvenido, Tutor ${user?.displayName || ''}!`}
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-2">
                        {isEditing ? 'Actualiza tu información profesional.' : 'Completa tu perfil para acceder a tus herramientas.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="hidden" name="userId" value={user?.uid} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="flex items-center gap-2"><UserIcon className="w-4 h-4"/> Nombres</Label>
                                <Input id="firstName" name="firstName" placeholder="Tus nombres" defaultValue={profileData?.firstName} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="flex items-center gap-2"><CaseSensitive className="w-4 h-4"/> Apellidos</Label>
                                <Input id="lastName" name="lastName" placeholder="Tus apellidos" defaultValue={profileData?.lastName} required />
                            </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="dni" className="flex items-center gap-2"><Hash className="w-4 h-4"/> DNI</Label>
                                <Input id="dni" name="dni" type="text" placeholder="Tu número de DNI" defaultValue={profileData?.dni} required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4"/> Teléfono</Label>
                                <Input id="phone" name="phone" placeholder="987654321" defaultValue={profileData?.phone} required />
                            </div>
                            <div className="space-y-2 text-center">
                                <Label className="flex items-center gap-2 mb-2.5 justify-center"><VenetianMask className="w-4 h-4"/> Género</Label>
                                <RadioGroup name="gender" defaultValue={profileData?.gender} required className="flex gap-2 justify-center" onValueChange={setSelectedGender}>
                                     <Label htmlFor="g-male" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all w-full", selectedGender === 'masculino' && 'border-primary ring-2 ring-primary/50' )}>
                                        <RadioGroupItem value="masculino" id="g-male" className="sr-only" />
                                        <span className="text-xl text-[#60a5fa]" aria-hidden="true">♂</span>
                                    </Label>
                                    <Label htmlFor="g-female" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all w-full", selectedGender === 'femenino' && 'border-primary ring-2 ring-primary/50' )}>
                                        <RadioGroupItem value="femenino" id="g-female" className="sr-only" />
                                        <span className="text-xl text-[#f472b6]" aria-hidden="true">♀</span>
                                    </Label>
                                    <Label htmlFor="g-other" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all w-full", selectedGender === 'prefiero no decirlo' && 'border-primary ring-2 ring-primary/50' )}>
                                        <RadioGroupItem value="prefiero no decirlo" id="g-other" className="sr-only" />
                                        <span className="text-base font-bold py-1 px-0.5 text-muted-foreground" aria-hidden="true">?</span>
                                    </Label>
                                </RadioGroup>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4"/> Email (no editable)</Label>
                                <Input id="email" name="email" type="email" value={user?.email || ''} readOnly disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="workArea" className="flex items-center gap-2"><GraduationCap className="w-4 h-4"/> Área de Trabajo</Label>
                                <Select name="workArea" defaultValue={profileData?.tutorDetails?.workArea} required>
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
                        </div>

                        <div className="md:col-span-2 text-center pt-4">
                            <Button type="submit" className="w-full max-w-xs mx-auto" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isSubmitting ? 'Guardando...' : 'Guardar Perfil'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
