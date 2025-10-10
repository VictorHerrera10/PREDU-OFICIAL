'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActionState, useEffect, useMemo, useState, useRef } from "react";
import { registerTutor } from "@/app/actions";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { SubmitButton } from "./submit-button";
import { KeySquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { UniqueTutorPlans } from "./unique-tutor-plans";

type Institution = {
  id: string;
  name: string;
  region: string;
};

type State = {
  message?: string | null;
  success?: boolean;
};

const initialState: State = {
  message: null,
  success: false,
};

export function TutorRegistrationForm({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [state, formAction] = useActionState(registerTutor, initialState);

  const [selectedRegion, setSelectedRegion] = useState('');
  const [accessCode, setAccessCode] = useState(Array(6).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const institutionsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'institutions');
  }, [firestore]);

  const { data: institutions, isLoading } = useCollection<Institution>(institutionsCollectionRef);

  const filteredInstitutions = useMemo(() => {
    if (!institutions || !selectedRegion) return [];
    return institutions.filter(inst => inst.region === selectedRegion);
  }, [institutions, selectedRegion]);
  
  useEffect(() => {
    if (state.message) {
      if(state.success) {
        toast({
          title: '¡Registro Exitoso! ✅',
          description: state.message,
        });
        setIsOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error en el Registro 😵',
          description: state.message,
        });
      }
    }
    if (state.success) {
        setIsOpen(false);
    }
  }, [state, toast]);

   const handleCodeChange = (index: number, value: string) => {
    if (/^[a-zA-Z0-9]*$/.test(value) && value.length <= 1) {
      const newCode = [...accessCode];
      newCode[index] = value.toUpperCase();
      setAccessCode(newCode);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !accessCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').toUpperCase().slice(0, 6);
    const newCode = [...accessCode];
    for (let i = 0; i < 6; i++) {
      newCode[i] = pastedData[i] || '';
    }
    setAccessCode(newCode);

    const lastFullIndex = Math.min(pastedData.length, 6) -1;
    if (lastFullIndex >= 0 && inputRefs.current[lastFullIndex]) {
       inputRefs.current[lastFullIndex]?.focus();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
         <div className="absolute top-4 right-4">
            <UniqueTutorPlans>
                 <Button variant="outline" className="text-xs h-auto p-2 border-dashed hover:border-primary hover:text-primary transition-all">¿Eres un tutor independiente?</Button>
            </UniqueTutorPlans>
        </div>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle className="text-primary text-2xl">Registro de Tutor 🧑‍🏫</DialogTitle>
            <DialogDescription>
              Completa los datos para acceder a las herramientas de tutor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input type="hidden" name="userId" value={user?.uid} />
            <input type="hidden" name="accessCode" value={accessCode.join('')} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label htmlFor="region">📍 Región</Label>
                  <Select name="region" required onValueChange={setSelectedRegion}>
                      <SelectTrigger id="region">
                          <SelectValue placeholder="Selecciona" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="norte">Norte</SelectItem>
                          <SelectItem value="centro">Centro</SelectItem>
                          <SelectItem value="sur">Sur</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
               <div className="space-y-2">
                <Label htmlFor="roleInInstitution">💼 Rol en la Institución</Label>
                <Select name="roleInInstitution" required>
                  <SelectTrigger id="roleInInstitution">
                    <SelectValue placeholder="Selecciona tu rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="psicologo">Psicólogo</SelectItem>
                    <SelectItem value="docente">Docente</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="autoridades gubernamentales">Autoridades Gubernamentales</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="institutionId">🏫 Institución Educativa</Label>
              <Select name="institutionId" required disabled={!selectedRegion || isLoading}>
                <SelectTrigger id="institutionId">
                  <SelectValue placeholder={!selectedRegion ? 'Primero selecciona una región' : 'Selecciona una institución'} />
                </SelectTrigger>
                <SelectContent>
                  {filteredInstitutions?.map(inst => (
                    <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex flex-col items-center">
                <Label className="flex items-center gap-2 mb-2 text-center"><KeySquare className="w-4 h-4"/> Código de Acceso</Label>
                <div className="flex justify-center gap-2">
                    {accessCode.map((digit, index) => (
                        <Input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="w-10 h-10 text-center text-lg font-mono uppercase bg-input"
                            required
                        />
                    ))}
                </div>
            </div>

          </div>
          <DialogFooter className="flex flex-row sm:justify-between items-center pt-4">
              <DialogClose asChild>
                  <Button type="button" variant="secondary">
                      Cancelar
                  </Button>
              </DialogClose>
              <SubmitButton className="btn-retro !text-sm">Completar Registro</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
