'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { createIndependentTutorGroup } from '@/app/actions';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, UserCheck } from 'lucide-react';

type IndependentTutorGroup = {
  id: string;
  name: string;
  tutorName: string;
  uniqueCode: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

export function IndependentTutorsTable() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const groupsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'independentTutorGroups');
  }, [firestore]);

  const { data: groups, isLoading } = useCollection(groupsCollectionRef);

  const formatDate = (timestamp: any) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') {
      return 'N/A';
    }
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'dd/MM/yyyy');
  };

  const handleCreate = async (formData: FormData) => {
    setIsProcessing(true);
    try {
      const result = await createIndependentTutorGroup(formData);
      if (result.success) {
        toast({
          title: 'Grupo Creado ✅',
          description: `El grupo "${result.name}" ha sido agregado.`,
        });
        setIsAddDialogOpen(false);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al Crear 😵',
          description: result.message,
        });
      }
    } catch (error) {
       toast({
          variant: 'destructive',
          title: 'Error Inesperado',
          description: 'Ocurrió un error al procesar la solicitud.',
        });
    } finally {
        setIsProcessing(false);
    }
  };

  const AddGroupDialog = () => (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Crear Grupo
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <form action={handleCreate}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><UserCheck className="text-primary"/> Crear Nuevo Grupo de Tutor</DialogTitle>
            <DialogDescription>
              Completa los detalles para crear un nuevo grupo para un tutor que no pertenece a una institución. Se generará un código único y se asignarán límites por defecto.
            </DialogDescription>
          </DialogHeader>
           <div className="grid gap-4 py-4">
                <div className="space-y-2">
                <Label htmlFor="name">🧑‍🏫 Nombre del Grupo</Label>
                <Input id="name" name="name" placeholder="Ej: Grupo de Orientación Vocacional 2024" required />
                </div>
                <div className="space-y-2">
                <Label htmlFor="tutorName">👤 Nombre del Tutor a Cargo</Label>
                <Input id="tutorName" name="tutorName" placeholder="Nombre completo del tutor líder" required />
                </div>
            </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isProcessing}>{isProcessing ? 'Creando...' : 'Crear Grupo'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
         <div className="flex justify-end">
             <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end mb-4">
        <AddGroupDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del Grupo</TableHead>
            <TableHead>Tutor a Cargo</TableHead>
            <TableHead>Código Único</TableHead>
            <TableHead>Fecha Creación</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups && groups.length > 0 ? (
            groups.map((group, index) => (
              <motion.tr 
                key={group.id}
                className="hover:bg-muted/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <TableCell className="font-medium">{group.name}</TableCell>
                <TableCell>{group.tutorName}</TableCell>
                <TableCell><code className="bg-muted px-2 py-1 rounded text-primary">{group.uniqueCode}</code></TableCell>
                <TableCell>{formatDate(group.createdAt)}</TableCell>
              </motion.tr>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No hay grupos de tutores independientes. ¡Crea el primero! 🚀
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
