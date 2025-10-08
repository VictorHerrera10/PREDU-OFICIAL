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

  const institutionsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'institutions');
  }, [firestore]);

  const { data: institutions, isLoading } = useCollection<Institution>(institutionsCollectionRef);
  
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
              Ingresa tu código de acceso, selecciona tu institución y tu rol para acceder a las herramientas de tutor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <input type="hidden" name="userId" value={user?.uid} />
            
            <div className="space-y-2">
              <Label htmlFor="access-code">🔑 Código de Acceso</Label>
              <Input id="access-code" name="accessCode" placeholder="Tu código secreto" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="institutionId">🏫 Institución Educativa</Label>
              <Select name="institutionId" required>
                <SelectTrigger id="institutionId" disabled={isLoading}>
                  <SelectValue placeholder={isLoading ? 'Cargando...' : 'Selecciona una institución'} />
                </SelectTrigger>
                <SelectContent>
                  {institutions?.map(inst => (
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
