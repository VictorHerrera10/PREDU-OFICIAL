'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

import { createInstitution, deleteInstitution } from '@/app/actions';

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, PlusCircle, Trash2, School, Eye } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

type Institution = {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  region: string;
  level: string;
  studentLimit: number;
  tutorLimit: number;
  directorName: string;
  directorEmail: string;
  directorPhone?: string;
  teachingModality: string;
  logoUrl?: string;
  uniqueCode: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

export function InstitutionsTable() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const institutionsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'institutions');
  }, [firestore]);

  const { data: institutions, isLoading } = useCollection(institutionsCollectionRef);

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
      const result = await createInstitution(formData);
      if (result.success) {
        toast({
          title: 'Institución Creada ✅',
          description: `La institución "${result.name}" ha sido agregada.`,
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

  const handleDelete = async (institutionId: string) => {
    setIsProcessing(true);
    const result = await deleteInstitution(institutionId);
    if (result.success !== false) { // action redirects, so we only check for failure
      toast({
        title: 'Institución Eliminada 🗑️',
        description: 'La institución ha sido eliminada permanentemente.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al Eliminar 😵',
        description: result.message,
      });
    }
    setIsProcessing(false);
  };

  const InstitutionCreationFormFields = () => (
    <ScrollArea className="h-96">
      <div className="grid gap-4 py-4 pr-6">
        <div className="space-y-2">
          <Label htmlFor="name">🏫 Nombre de la Institución</Label>
          <Input id="name" name="name" placeholder="Ej: Colegio Nacional..." required />
        </div>
         <div className="space-y-2">
            <Label htmlFor="region">📍 Región</Label>
            <Select name="region" >
                <SelectTrigger>
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
          <Label htmlFor="address">🗺️ Dirección Completa</Label>
          <Input id="address" name="address" placeholder="Ej: Av. Siempre Viva 123" required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="level">📚 Nivel</Label>
             <Select name="level" >
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona un nivel" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="primaria">Primaria</SelectItem>
                    <SelectItem value="secundaria">Secundaria</SelectItem>
                    <SelectItem value="superior">Superior</SelectItem>
                </SelectContent>
            </Select>
        </div>
         <div className="space-y-2">
            <Label htmlFor="teachingModality">👨‍🏫 Modalidad de Enseñanza</Label>
             <Select name="teachingModality" >
                <SelectTrigger>
                    <SelectValue placeholder="Selecciona una modalidad" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="presencial">Presencial</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="hibrida">Híbrida</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="directorName">👤 Nombre del Director</Label>
          <Input id="directorName" name="directorName" placeholder="Nombre completo del director" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="directorEmail">✉️ Email del Director</Label>
          <Input id="directorEmail" name="directorEmail" type="email" placeholder="director@institucion.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="directorPhone">📞 Teléfono del Director (Opcional)</Label>
          <Input id="directorPhone" name="directorPhone" placeholder="+51 987654321" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logoUrl">🖼️ URL del Logo (Opcional)</Label>
          <Input id="logoUrl" name="logoUrl" placeholder="https://dominio.com/logo.png" />
        </div>
         <div className="space-y-2">
          <Label htmlFor="contactEmail">📧 Email de Contacto General</Label>
          <Input id="contactEmail" name="contactEmail" type="email" placeholder="contacto@institucion.com" required />
        </div>
      </div>
    </ScrollArea>
  );

  const AddInstitutionDialog = () => (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Agregar Institución
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form action={handleCreate}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><School className="text-primary"/> Agregar Nueva Institución</DialogTitle>
            <DialogDescription>
              Completa los detalles para registrar una nueva institución educativa. Se generará un código único y los límites se establecerán en 0.
            </DialogDescription>
          </DialogHeader>
          <InstitutionCreationFormFields />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={isProcessing}>{isProcessing ? 'Creando...' : 'Crear Institución'}</Button>
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
        <AddInstitutionDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Región</TableHead>
            <TableHead>Director</TableHead>
            <TableHead>Código Único</TableHead>
            <TableHead>Fecha Creación</TableHead>
            <TableHead>
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {institutions && institutions.length > 0 ? (
            institutions.map((institution, index) => (
              <motion.tr 
                key={institution.id}
                className="hover:bg-muted/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <TableCell className="font-medium">{institution.name}</TableCell>
                <TableCell>{institution.region}</TableCell>
                <TableCell>{institution.directorName}</TableCell>
                <TableCell><code className="bg-muted px-2 py-1 rounded text-primary">{institution.uniqueCode}</code></TableCell>
                <TableCell>{formatDate(institution.createdAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/institutions/${institution.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                              </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro de eliminar esta institución?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente. 💀
                              </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(institution.id)} disabled={isProcessing}>
                                  {isProcessing ? 'Eliminando...' : 'Sí, eliminar'}
                              </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No hay instituciones registradas. ¡Agrega la primera! 🏫
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
