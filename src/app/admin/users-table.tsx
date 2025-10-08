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
import { MoreHorizontal, PlusCircle, User, UserX, UserCheck, Edit, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/app/actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

type UserProfile = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'student' | 'tutor' | null;
  creationDate?: { seconds: number, nanoseconds: number };
}

export function UsersTable() {
  const firestore = useFirestore();
  const functions = useFunctions();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
      console.error('Error al eliminar el usuario:', error);
      toast({
        variant: 'destructive',
        title: 'Error al Eliminar 😵',
        description: error.message || 'No se pudo eliminar al usuario. Revisa la consola para más detalles.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateUser = async (formData: FormData) => {
    if (!selectedUser) return;
  
    const result = await updateUser(selectedUser.id, formData);
  
    if (result.success) {
      toast({
        title: "Usuario Actualizado ✅",
        description: `Los datos de ${result.username} han sido actualizados.`,
      });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } else {
      toast({
        variant: "destructive",
        title: "Error al Actualizar 😵",
        description: result.message,
      });
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

  const formatDate = (timestamp: any) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') {
      return 'N/A';
    }
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'dd/MM/yyyy');
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

  const EditUserDialog = () => {
    if (!selectedUser) return null;
    return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <form action={handleUpdateUser}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="text-primary"/> Editar Usuario
                        </DialogTitle>
                        <DialogDescription>
                            Modifica los datos del usuario. Los cambios se guardarán al hacer clic en "Guardar Cambios".
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">🧑‍🎓 Nombre de Usuario</Label>
                            <Input
                                id="username"
                                name="username"
                                defaultValue={selectedUser.username}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">✉️ Email (no editable)</Label>
                            <Input
                                id="email"
                                name="email"
                                value={selectedUser.email}
                                readOnly
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">🎭 Rol</Label>
                            <Select name="role" defaultValue={selectedUser.role || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar un rol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="student">🧑‍🎓 Estudiante</SelectItem>
                                    <SelectItem value="tutor">🧑‍🏫 Tutor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="creationDate">📅 Fecha de Creación</Label>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md bg-muted/50">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(selectedUser.creationDate)}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Guardar Cambios</Button>
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
             <Skeleton className="h-8 w-36" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
             <div key={i} className="grid grid-cols-5 items-center gap-4 p-2">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-5 w-24" />
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre de Estudiante</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Fecha Creación</TableHead>
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
                <TableCell>{formatDate(user.creationDate)}</TableCell>
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
                      <DropdownMenuItem onSelect={() => handleEditUser(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
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
                              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
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
              <TableCell colSpan={5} className="h-24 text-center">
                No hay usuarios registrados. ¡Agrega el primero! 🚀
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <EditUserDialog />
    </>
  );
}
