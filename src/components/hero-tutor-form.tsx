'use client';

import { useActionState, useEffect, useState } from "react";
import { registerHeroTutor } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import Confetti from 'react-confetti';
import useResizeObserver from 'use-resize-observer';
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SubmitButton } from "./submit-button";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";


type State = {
  message?: string | null;
  success?: boolean;
};

const initialState: State = {
  message: null,
  success: false,
};

export function HeroTutorForm({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction] = useActionState(registerHeroTutor, initialState);
    const [showConfetti, setShowConfetti] = useState(false);
    const { ref, width = 0, height = 0 } = useResizeObserver<HTMLBodyElement>();
    const [selectedGender, setSelectedGender] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            ref(document.body);
        }
    }, [ref]);

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({
                    title: "¡Bienvenido, Tutor Héroe! 🦸",
                    description: state.message,
                });
                setShowConfetti(true);
                // No cerramos el dialogo, mostramos el mensaje de exito
            } else {
                toast({
                    variant: "destructive",
                    title: "Error en el Registro 😵",
                    description: state.message,
                });
            }
        }
    }, [state, toast]);

    if (state.success) {
        return (
             <div className="text-center flex flex-col items-center justify-center p-8">
                {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                        <Crown className="w-8 h-8 text-destructive" /> ¡Registro Completado!
                    </DialogTitle>
                </DialogHeader>
                <div className="my-4 text-center">
                    <p className="text-muted-foreground">{state.message}</p>
                    <p className="mt-4">Serás redirigido a la página de inicio de sesión.</p>
                </div>
                <DialogFooter>
                    <Button onClick={() => router.push('/login')}>
                        Ir a Iniciar Sesión 🚀
                    </Button>
                </DialogFooter>
            </div>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                 <form action={formAction}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
                           <Crown /> ¡Regístrate como Tutor Héroe!
                        </DialogTitle>
                        <DialogDescription>
                            Completa tu perfil para empezar a guiar a tus estudiantes con herramientas avanzadas.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-96">
                        <div className="space-y-4 py-4 pr-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Nombres</Label>
                                    <Input id="firstName" name="firstName" placeholder="Tus nombres" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Apellidos</Label>
                                    <Input id="lastName" name="lastName" placeholder="Tus apellidos" required />
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dni">DNI</Label>
                                    <Input id="dni" name="dni" type="text" placeholder="Tu número de DNI" required maxLength={8} />
                                </div>
                                 <div className="space-y-2">
                                    <Label>Género</Label>
                                    <RadioGroup name="gender" required className="flex gap-2 justify-center pt-2" onValueChange={setSelectedGender}>
                                        <Label htmlFor="h-male" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all w-full", selectedGender === 'masculino' && 'border-primary ring-2 ring-primary/50' )}>
                                            <RadioGroupItem value="masculino" id="h-male" className="sr-only" />
                                            <span className="text-lg text-[#60a5fa]">♂</span>
                                        </Label>
                                        <Label htmlFor="h-female" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all w-full", selectedGender === 'femenino' && 'border-primary ring-2 ring-primary/50' )}>
                                            <RadioGroupItem value="femenino" id="h-female" className="sr-only" />
                                            <span className="text-lg text-[#f472b6]">♀</span>
                                        </Label>
                                        <Label htmlFor="h-other" className={cn("flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all w-full", selectedGender === 'prefiero no decirlo' && 'border-primary ring-2 ring-primary/50' )}>
                                            <RadioGroupItem value="prefiero no decirlo" id="h-other" className="sr-only" />
                                            <span className="text-sm font-bold py-1 px-0.5 text-muted-foreground">?</span>
                                        </Label>
                                    </RadioGroup>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="username">Nombre de Usuario</Label>
                                <Input id="username" name="username" placeholder="Elige un nombre de usuario" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Correo</Label>
                                <Input id="email" name="email" type="email" placeholder="tu@email.com" required />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="password">Contraseña</Label>
                                <Input id="password" name="password" type="password" placeholder="Crea una contraseña segura" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input id="phone" name="phone" placeholder="987654321" required maxLength={9} />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="groupName">Nombre del Grupo</Label>
                                    <Input id="groupName" name="groupName" placeholder="Ej: Orientación Vocacional 2024" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="region">Región</Label>
                                    <Select name="region" required>
                                        <SelectTrigger id="region"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="norte">Norte</SelectItem>
                                            <SelectItem value="centro">Centro</SelectItem>
                                            <SelectItem value="sur">Sur</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reasonForUse">Razón de Uso</Label>
                                <Textarea id="reasonForUse" name="reasonForUse" placeholder="¿Cómo planeas usar la plataforma para ayudar a tus estudiantes?" required />
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
                        <SubmitButton>Crear Cuenta Héroe</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}