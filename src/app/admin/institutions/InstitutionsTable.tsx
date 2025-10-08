'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { createInstitution, updateInstitution, deleteInstitution } from '@/app/actions';

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
import { MoreHorizontal, PlusCircle, Edit, Trash2, School } from 'lucide-react';
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
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    setIsProcessing(false);
  };
  
  const handleEdit = (institution: Institution) => {
    setSelectedInstitution(institution);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (formData: FormData) => {
    if (!selectedInstitution) return;
    setIsProcessing(true);
    const result = await updateInstitution(selectedInstitution.id, formData);
    if (result.success) {
      toast({
        title: 'Institución Actualizada ✅',
        description: `Los datos de "${result.name}" han sido actualizados.`,
      });
      setIsEditDialogOpen(false);
      setSelectedInstitution(null);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error al Actualizar 😵',
        description: result.message,
      });
    }
    setIsProcessing(false);
  };

  const handleDelete = async (institutionId: string) => {
    setIsProcessing(true);
    const result = await deleteInstitution(institutionId);
    if (result.success) {
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

  const InstitutionFormFields = ({ institution }: { institution?: Institution }) => (
    <ScrollArea className="h-96">
      <div className="grid gap-4 py-4 pr-6">
        <div className="space-y-2">
          <Label htmlFor="name">🏫 Nombre de la Institución</Label>
          <Input id="name" name="name" placeholder="Ej: Colegio Nacional..." defaultValue={institution?.name} required />
        </div>
         <div className="space-y-2">
            <Label htmlFor="region">📍 Región</Label>
            <Select name="region" defaultValue={institution?.region}>
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
          <Input id="address" name="address" placeholder="Ej: Av. Siempre Viva 123" defaultValue={institution?.address} required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="level">📚 Nivel</Label>
             <Select name="level" defaultValue={institution?.level}>
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
             <Select name="teachingModality" defaultValue={institution?.teachingModality}>
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
          <Label htmlFor="studentLimit">🧑‍🎓 Límite de Estudiantes</Label>
          <Input id="studentLimit" name="studentLimit" type="number" placeholder="Ej: 150" defaultValue={institution?.studentLimit} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="directorName">👤 Nombre del Director</Label>
          <Input id="directorName" name="directorName" placeholder="Nombre completo del director" defaultValue={institution?.directorName} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="directorEmail">✉️ Email del Director</Label>
          <Input id="directorEmail" name="directorEmail" type="email" placeholder="director@institucion.com" defaultValue={institution?.directorEmail} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="directorPhone">📞 Teléfono del Director (Opcional)</Label>
          <Input id="directorPhone" name="directorPhone" placeholder="+51 987654321" defaultValue={institution?.directorPhone} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logoUrl">🖼️ URL del Logo (Opcional)</Label>
          <Input id="logoUrl" name="logoUrl" placeholder="https://dominio.com/logo.png" defaultValue={institution?.logoUrl} />
        </div>
         <div className="space-y-2">
          <Label htmlFor="contactEmail">📧 Email de Contacto General</Label>
          <Input id="contactEmail" name="contactEmail" type="email" placeholder="contacto@institucion.com" defaultValue={institution?.contactEmail} required />
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
              Completa los detalles para registrar una nueva institución educativa. Se generará un código único.
            </DialogDescription>
          </DialogHeader>
          <InstitutionFormFields />
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

  const EditInstitutionDialog = () => {
    if (!selectedInstitution) return null;
    return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
                <form action={handleUpdate}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="text-primary"/> Editar Institución
                        </DialogTitle>
                        <DialogDescription>
                           Modifica los datos de la institución. El código único no se puede cambiar.
                        </DialogDescription>
                    </DialogHeader>
                    <InstitutionFormFields institution={selectedInstitution} />
                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isProcessing}>{isProcessing ? 'Guardando...' : 'Guardar Cambios'}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
  };

  if (isLoading) {
    return (
      <div className="p-4">
         <div className="flex justify-end mb-4">
             <Skeleton className="h-8 w-40" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
             <div key={i} className="grid grid-cols-5 items-center gap-4 p-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-40" />
                <div className="flex justify-end">
                    <Skeleton className="h-6 w-6" />
                </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
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
                      <DropdownMenuItem onSelect={() => handleEdit(institution)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
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
      <EditInstitutionDialog />
    </>
  );
}
