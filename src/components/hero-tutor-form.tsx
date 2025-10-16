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
import { useUser } from "@/firebase";


type State = {
  message?: string | null;
  success?: boolean;
  dni?: string | null;
};

const initialState: State = {
  message: null,
  success: false,
  dni: null,
};

export function HeroTutorForm({ children }: { children: React.ReactNode }) {
    const { toast } = useToast();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [state, formAction] = useActionState(registerHeroTutor, initialState);
    const { ref, width = 0, height = 0 } = useResizeObserver<HTMLBodyElement>();
    const [selectedGender, setSelectedGender] = useState('');
    const { user } = useUser();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            ref(document.body);
        }
    }, [ref]);

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({
                    title: "¡Solicitud Enviada! 🦸",
                    description: state.message,
                });
                if (state.dni) {
                    router.push(`/tutor-request-status?dni=${state.dni}`);
                }
                setIsOpen(false);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error en la Solicitud 😵",
                    description: state.message,
                });
            }
        }
    }, [state, toast, router]);


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl">
                 <form action={formAction}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-destructive flex items-center gap-2">
                           <Crown /> ¡Solicita ser un Tutor Héroe!
                        </DialogTitle>
                        <DialogDescription>
                            Completa tu solicitud para empezar a guiar a tus estudiantes con herramientas avanzadas. Tu cuenta será revisada por un administrador.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-96">
                        <div className="space-y-4 py-4 pr-6">
                             <input type="hidden" name="userId" value={user?.uid} />
                             <input type="hidden" name="username" value={user?.displayName || ''} />
                             <input type="hidden" name="email" value={user?.email || ''} />
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
                                            <SelectItem value="Amazonas">Amazonas</SelectItem>
                                            <SelectItem value="Áncash">Áncash</SelectItem>
                                            <SelectItem value="Apurímac">Apurímac</SelectItem>
                                            <SelectItem value="Arequipa">Arequipa</SelectItem>
                                            <SelectItem value="Ayacucho">Ayacucho</SelectItem>
                                            <SelectItem value="Cajamarca">Cajamarca</SelectItem>
                                            <SelectItem value="Callao">Callao</SelectItem>
                                            <SelectItem value="Cusco">Cusco</SelectItem>
                                            <SelectItem value="Huancavelica">Huancavelica</SelectItem>
                                            <SelectItem value="Huánuco">Huánuco</SelectItem>
                                            <SelectItem value="Ica">Ica</SelectItem>
                                            <SelectItem value="Junín">Junín</SelectItem>
                                            <SelectItem value="La Libertad">La Libertad</SelectItem>
                                            <SelectItem value="Lambayeque">Lambayeque</SelectItem>
                                            <SelectItem value="Lima">Lima</SelectItem>
                                            <SelectItem value="Loreto">Loreto</SelectItem>
                                            <SelectItem value="Madre de Dios">Madre de Dios</SelectItem>
                                            <SelectItem value="Moquegua">Moquegua</SelectItem>
                                            <SelectItem value="Pasco">Pasco</SelectItem>
                                            <SelectItem value="Piura">Piura</SelectItem>
                                            <SelectItem value="Puno">Puno</SelectItem>
                                            <SelectItem value="San Martín">San Martín</SelectItem>
                                            <SelectItem value="Tacna">Tacna</SelectItem>
                                            <SelectItem value="Tumbes">Tumbes</SelectItem>
                                            <SelectItem value="Ucayali">Ucayali</SelectItem>
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
                        <SubmitButton>Enviar Solicitud</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
