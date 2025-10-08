'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useFunctions } from '@/firebase';
import { collection } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { motion } from 'framer-motion';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { MoreHorizontal, PlusCircle, User, UserX, UserCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export function UsersTable() {
  const firestore = useFirestore();
  const functions = useFunctions();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const usersCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection(usersCollectionRef);

  const handleDeleteUser = async (uid: string) => {
    setIsDeleting(true);
    if (!functions) {
        toast({
            variant: 'destructive',
            title: 'Error de Configuración',
            description: 'El servicio de funciones no está disponible.',
        });
        setIsDeleting(false);
        return;
    }
    try {
      const deleteUser = httpsCallable(functions, 'deleteUser');
      await deleteUser({ uid });
      toast({
        title: 'Usuario Eliminado ✅',
        description: 'El usuario ha sido eliminado de la plataforma.',
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Eliminar 😵',
        description: error.message || 'No se pudo eliminar al usuario.',
      });
    } finally {
      setIsDeleting(false);
    }
  };


  const renderRoleBadge = (role: string | null) => {
    if (!role) {
      return <Badge variant="outline" className="border-dashed">PENDIENTE</Badge>;
    }
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">👑 Admin</Badge>;
      case 'tutor':
        return <Badge variant="secondary">🧑‍🏫 Tutor</Badge>;
      case 'student':
        return <Badge>🧑‍🎓 Estudiante</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };
  
  const AddUserDialog = () => (
    <Dialog>
        <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Agregar Usuario
                </span>
            </Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><User className="text-primary"/> Agregar Nuevo Usuario</DialogTitle>
                <DialogDescription>
                    Completa los detalles para crear una nueva cuenta. Se enviará una contraseña temporal al email proporcionado.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Nombre</Label>
                    <Input id="name" placeholder="Nombre completo" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" placeholder="usuario@email.com" className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Crear Usuario</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );


  if (isLoading) {
    return (
      <div className="p-4">
         <div className="flex justify-end mb-4">
             <Skeleton className="h-8 w-36" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
             <div key={i} className="grid grid-cols-4 items-center gap-4 p-2">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-6 w-24 rounded-full" />
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
        <AddUserDialog />
      </div>
      <motion.div 
        className="rounded-lg bg-card/80 backdrop-blur-sm border border-border/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre de Estudiante</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user, index) => (
                <motion.tr 
                  key={user.id}
                  className="hover:bg-muted/50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{renderRoleBadge(user.role)}</TableCell>
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
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive focus:bg-destructive/10" disabled={user.role === 'admin'}>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás absolutely seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la cuenta del usuario y sus datos de nuestros servidores. 💀
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)} disabled={isDeleting}>
                                    {isDeleting ? 'Eliminando...' : (<><UserCheck className="mr-2 h-4 w-4" /> Sí, eliminar</>)}
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
                <TableCell colSpan={4} className="h-24 text-center">
                  No hay usuarios registrados. ¡Agrega el primero! 🚀
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </motion.div>
    </>
  );
}
