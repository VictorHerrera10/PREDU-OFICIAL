'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { approveTutorRequest, rejectTutorRequest } from '@/app/actions';

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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Check, X, Clock, Eye, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';

type TutorRequest = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  dni: string;
  phone: string;
  groupName: string;
  region: string;
  reasonForUse: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: { seconds: number; nanoseconds: number };
};

export function TutorRequestsTable() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const requestsCollectionRef = useMemo(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'tutorRequests'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: requests, isLoading } = useCollection<TutorRequest>(requestsCollectionRef);

  const formatDate = (timestamp: any) => {
    if (!timestamp || typeof timestamp.seconds !== 'number') return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return format(date, 'dd/MM/yyyy HH:mm');
  };

  const handleApprove = async (requestId: string) => {
    setIsProcessing(requestId);
    const result = await approveTutorRequest(requestId);
    if (result.success) {
      toast({ title: 'Solicitud Aprobada ✅', description: 'El tutor ha sido creado y notificado.' });
    } else {
      toast({ variant: 'destructive', title: 'Error al Aprobar 😵', description: result.message });
    }
    setIsProcessing(null);
  };

  const handleReject = async (requestId: string) => {
    setIsProcessing(requestId);
    const result = await rejectTutorRequest(requestId);
    if (result.success) {
      toast({ title: 'Solicitud Rechazada ❌', description: 'La solicitud ha sido marcada como rechazada.' });
    } else {
      toast({ variant: 'destructive', title: 'Error al Rechazar 😵', description: result.message });
    }
    setIsProcessing(null);
  };
  
  const renderStatusBadge = (status: TutorRequest['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500/20 text-green-400 border-green-500/50"><Check className="mr-1 h-3 w-3" />Aprobado</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><X className="mr-1 h-3 w-3" />Rechazado</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="animate-pulse"><Clock className="mr-1 h-3 w-3" />Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre del Solicitante</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Fecha Solicitud</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead><span className="sr-only">Acciones</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests && requests.length > 0 ? (
            requests.map((req, index) => (
              <motion.tr 
                key={req.id}
                className="hover:bg-muted/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <TableCell className="font-medium">{req.username}</TableCell>
                <TableCell>{req.email}</TableCell>
                <TableCell>{formatDate(req.createdAt)}</TableCell>
                <TableCell>{renderStatusBadge(req.status)}</TableCell>
                <TableCell>
                  <Dialog>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isProcessing === req.id}>
                          {isProcessing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                         <DialogTrigger asChild>
                           <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />Ver Detalles</DropdownMenuItem>
                         </DialogTrigger>
                        {req.status === 'pending' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleApprove(req.id)} className="text-green-500 focus:text-green-500 focus:bg-green-500/10">
                              <Check className="mr-2 h-4 w-4" />Aprobar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(req.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                              <X className="mr-2 h-4 w-4" />Rechazar
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Detalles de la Solicitud</DialogTitle>
                            <DialogDescription>De {req.firstName} {req.lastName} ({req.username})</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-2 text-sm">
                            <div className="grid grid-cols-[100px_1fr] items-center">
                                <span className="text-muted-foreground">DNI:</span>
                                <span>{req.dni}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center">
                                <span className="text-muted-foreground">Teléfono:</span>
                                <span>{req.phone}</span>
                            </div>
                             <div className="grid grid-cols-[100px_1fr] items-center">
                                <span className="text-muted-foreground">Región:</span>
                                <span>{req.region}</span>
                            </div>
                            <div className="grid grid-cols-[100px_1fr] items-center">
                                <span className="text-muted-foreground">Grupo:</span>
                                <span>{req.groupName}</span>
                            </div>
                             <div className="grid grid-cols-1">
                                <span className="text-muted-foreground">Razón de uso:</span>
                                <p className="border bg-muted/50 p-2 rounded-md mt-1">{req.reasonForUse}</p>
                            </div>
                        </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </motion.tr>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No hay solicitudes pendientes. 🚀
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
