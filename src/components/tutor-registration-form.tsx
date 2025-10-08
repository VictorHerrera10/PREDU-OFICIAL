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
import { useActionState, useEffect, useMemo, useState } from "react";
import { registerTutor } from "@/app/actions";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { SubmitButton } from "./submit-button";

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle className="text-primary text-2xl">Registro de Tutor 🧑‍🏫</DialogTitle>
            <DialogDescription>
              Completa los datos para acceder a las herramientas de tutor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input type="hidden" name="userId" value={user?.uid} />
            
            <div className="space-y-2">
              <Label htmlFor="access-code">🔑 Código de Acceso</Label>
              <Input id="access-code" name="accessCode" placeholder="Tu código secreto" required />
            </div>

             <div className="space-y-2">
                <Label htmlFor="region">📍 Región</Label>
                <Select name="region" required onValueChange={setSelectedRegion}>
                    <SelectTrigger id="region">
                        <SelectValue placeholder="Selecciona una región" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="norte">Norte</SelectItem>
                        <SelectItem value="centro">Centro</SelectItem>
                        <SelectItem value="sur">Sur</SelectItem>
                    </SelectContent>
                </Select>
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
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
              <DialogClose asChild>
                  <Button type="button" variant="secondary">
                      Cancelar
                  </Button>
              </DialogClose>
              <SubmitButton>Completar Registro</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
