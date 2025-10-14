'use client';

import { useEffect, useState, useRef } from 'react';
import { User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useStorage } from '@/firebase';
import { uploadImage } from '@/lib/storage';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Loader2, Upload, User as UserIcon, Mail } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '@/components/ui/progress';
import { updateAdminProfile } from '@/app/actions';


type UserProfile = {
    username?: string;
    email?: string;
    profilePictureUrl?: string;
};


type Props = {
    user: User | null;
    profileData?: UserProfile | null;
};

export function AdminProfileForm({ user, profileData }: Props) {
    const { toast } = useToast();
    const router = useRouter();
    const storage = useStorage();

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
            formData.set('profilePictureUrl', profileData.profilePictureUrl);
        }
        
        // Server action will handle redirection on success
        const result = await updateAdminProfile(null, formData);

        // Only show toast on error, as success will redirect
        if (result?.message) {
            toast({
                variant: 'destructive',
                title: 'Error al actualizar 😵',
                description: result.message,
            });
        }
        
        setIsSubmitting(false);
    };


    return (
        <main className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
            <Card className="relative w-full max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border-border">
                <CardHeader className="text-center items-center">
                    <div className="relative flex justify-center mb-4 pt-8">
                         <Avatar className="w-24 h-24 border-4 border-destructive">
                            <AvatarImage src={imagePreview || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${user?.displayName}`} alt={user?.displayName || 'Avatar'} />
                            <AvatarFallback><Crown className="w-12 h-12" /></AvatarFallback>
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
                             <Progress value={uploadProgress} className="h-2 [&>div]:bg-destructive" />
                             <p className="text-xs text-muted-foreground mt-1">{`Subiendo... ${Math.round(uploadProgress)}%`}</p>
                        </div>
                    )}
                    <CardTitle className="text-3xl font-bold text-destructive">
                        Perfil de Administrador
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-2">
                        Actualiza tu nombre de usuario y tu foto.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input type="hidden" name="userId" value={user?.uid} />
                        
                        <div className="space-y-2">
                            <Label htmlFor="username" className="flex items-center gap-2"><UserIcon className="w-4 h-4"/> Nombre de Usuario</Label>
                            <Input id="username" name="username" placeholder="Tu nombre de admin" defaultValue={profileData?.username || ''} required />
                        </div>

                         <div className="space-y-2">
                           <Label className="flex items-center gap-2"><Mail className="w-4 h-4"/> Email (no editable)</Label>
                           <Input type="email" value={user?.email || ''} readOnly disabled />
                       </div>

                        <div className="text-center mt-6">
                            <Button type="submit" className="w-full max-w-xs mx-auto btn-retro" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : 'Guardar Perfil'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}
