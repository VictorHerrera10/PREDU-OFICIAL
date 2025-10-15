'use client';

import { useActionState, useEffect, useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { updateStudentProfile } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/firebase';
import { uploadImage } from '@/lib/storage';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GraduationCap, VenetianMask, X, User as UserIcon, CaseSensitive, Hash, Building, Phone, Calendar, Map, BookOpen, KeySquare, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';


type UserProfile = {
    firstName?: string;
    lastName?: string;
    dni?: string;
    age?: number;
    grade?: string;
    city?: string;
    phone?: string;
    gender?: string;
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
    const storage = useStorage();
    
    const isEditing = !!profileData?.firstName;
    const [selectedGender, setSelectedGender] = useState(profileData?.gender);
    const [institutionCode, setInstitutionCode] = useState(Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
        setIsSubmitting(true);
        
        const formData = new FormData(e.currentTarget);
        let uploadedImageUrl: string | null = null;

        if (imageFile && user && storage) {
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
        } else if (profileData?.profilePictureUrl) {
            // Keep the existing URL if no new file is selected
            formData.set('profilePictureUrl', profileData.profilePictureUrl);
        }
        
        const result = await updateStudentProfile(null, formData);

        if(result.success){
            toast({
                title: '¡Perfil Actualizado! ✅',
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


    const handleCodeChange = (index: number, value: string) => {
        const newCode = [...institutionCode];
        newCode[index] = value.toUpperCase();
        setInstitutionCode(newCode);

        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !institutionCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').toUpperCase().slice(0, 6);
        const newCode = [...institutionCode];
        for (let i = 0; i < 6; i++) {
            newCode[i] = pastedData[i] || '';
        }
        setInstitutionCode(newCode);

        const lastFullIndex = Math.min(pastedData.length, 6) - 1;
        if (lastFullIndex >= 0 && inputRefs.current[lastFullIndex]) {
            inputRefs.current[lastFullIndex]?.focus();
        }
    };


    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Card className="relative w-full max-w-4xl bg-card/80 backdrop-blur-sm border-border">
                {isEditing && (
                    <Button variant="ghost" size="icon" asChild className="absolute top-4 right-4 z-10">
                        <Link href="/student-dashboard">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Cerrar</span>
                        </Link>
                    </Button>
                )}
                <CardHeader className="text-center items-center">
                    <div className="relative flex justify-center mb-4 pt-8">
                         <Avatar className="w-24 h-24 border-4 border-primary">
                            <AvatarImage src={imagePreview || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.displayName}`} alt={user?.displayName || 'Avatar'} />
                            <AvatarFallback><GraduationCap className="w-12 h-12" /></AvatarFallback>
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
                        <div className="w-full max-w-xs pt-2">
                             <Progress value={uploadProgress} className="h-2" />
                             <p className="text-xs text-muted-foreground mt-1">{`Subiendo... ${Math.round(uploadProgress)}%`}</p>
                        </div>
                    )}
                    <CardTitle className="text-3xl font-bold text-primary">
                         {isEditing ? 'Edita tu Perfil' : `¡Casi listo, ${user?.displayName || 'Estudiante'}!`}
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-2">
                        {isEditing ? 'Actualiza tu información personal.' : 'Completa tu perfil para desbloquear todo tu potencial.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="hidden" name="userId" value={user?.uid} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="flex items-center gap-2"><UserIcon className="w-4 h-4"/> Nombres</Label>
                                <Input id="firstName" name="firstName" placeholder="Tus nombres completos" defaultValue={profileData?.firstName || ''} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="flex items-center gap-2"><CaseSensitive className="w-4 h-4"/> Apellidos</Label>
                                <Input id="lastName" name="lastName" placeholder="Tus apellidos completos" defaultValue={profileData?.lastName || ''} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-end">
                             <div className="space-y-2">
                                <Label htmlFor="dni" className="flex items-center gap-2"><Hash className="w-4 h-4"/> DNI</Label>
                                <Input id="dni" name="dni" type="text" placeholder="8 dígitos" defaultValue={profileData?.dni || ''} required maxLength={8} pattern="\d{8}" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="age" className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Edad</Label>
                                <Input id="age" name="age" type="number" placeholder="Ej: 16" defaultValue={profileData?.age || ''} required className="w-full" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="grade" className="flex items-center gap-2"><BookOpen className="w-4 h-4"/> Grado</Label>
                                <Select name="grade" defaultValue={profileData?.grade} required>
                                    <SelectTrigger><SelectValue placeholder="Selecciona tu grado" /></SelectTrigger>
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
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 items-end">
                             <div className="space-y-2">
                                <Label htmlFor="city" className="flex items-center gap-2"><Map className="w-4 h-4"/> Ciudad</Label>
                                <Input id="city" name="city" placeholder="Donde vives" defaultValue={profileData?.city || ''} required />
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
                             <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4"/> Teléfono</Label>
                                <Input id="phone" name="phone" placeholder="9 dígitos" defaultValue={profileData?.phone || ''} required maxLength={9} />
                            </div>
                        </div>
                        
                        <div className="pt-6 flex flex-col items-center">
                            <Label className="flex items-center gap-2 mb-2 text-center"><KeySquare className="w-4 h-4"/> Código de Colegio (Opcional)</Label>
                            <input type="hidden" name="institutionCode" value={institutionCode.join('')} />
                            <div className="flex gap-2">
                                {institutionCode.map((digit, index) => (
                                    <Input
                                        key={index}
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="w-12 h-12 text-center text-lg font-mono uppercase"
                                        disabled={!!profileData?.institutionId}
                                    />
                                ))}
                            </div>
                            {profileData?.institutionId && (
                                <p className="text-xs text-green-400 mt-2">Ya estás vinculado a una institución.</p>
                            )}
                        </div>

                        <div className="text-center mt-6">
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
