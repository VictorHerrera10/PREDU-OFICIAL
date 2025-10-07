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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export function TutorRegistrationForm({ children }: { children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary text-2xl">Registro de Tutor 🧑‍🏫</DialogTitle>
          <DialogDescription>
            Ingresa tu código de acceso y completa tus datos para acceder a las herramientas de tutor.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="access-code">🔑 Código de Acceso</Label>
            <Input id="access-code" placeholder="Tu código secreto" />
          </div>
          
          <div className="space-y-2">
            <Label>🏫 Institución Educativa</Label>
             <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label htmlFor="region" className="text-xs text-muted-foreground">Filtrar por Región</Label>
                    <Select>
                        <SelectTrigger id="region">
                            <SelectValue placeholder="Selecciona una región" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="norte">Norte</SelectItem>
                            <SelectItem value="sur">Sur</SelectItem>
                            <SelectItem value="centro">Centro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="school" className="text-xs text-muted-foreground">Buscar Institución</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input id="school" placeholder="Nombre del colegio..." className="pl-9" />
                    </div>
                </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tutor-role">💼 Rol en la Institución</Label>
            <Select>
              <SelectTrigger id="tutor-role">
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
            <Button type="submit">Completar Registro</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
