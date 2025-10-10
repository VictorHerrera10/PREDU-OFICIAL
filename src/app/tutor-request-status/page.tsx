'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Clock, CheckCircle, XCircle, KeySquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type TutorRequest = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  groupName?: string;
  uniqueCode?: string; // This will be on the IndependentTutorGroup, not the request
};

type IndependentTutorGroup = {
    uniqueCode: string;
}

function StatusDisplay() {
    const searchParams = useSearchParams();
    const dni = searchParams.get('dni');
    const firestore = useFirestore();

    const requestQuery = useMemo(() => {
        if (!firestore || !dni) return null;
        return query(
            collection(firestore, 'tutorRequests'),
            where('dni', '==', dni),
            limit(1)
        );
    }, [firestore, dni]);

    const { data: requests, isLoading: isLoadingRequest } = useCollection<TutorRequest>(requestQuery);
    const request = requests?.[0];

    // Find the group code after the request is approved
    const groupQuery = useMemo(() => {
        if (!firestore || !request || request.status !== 'approved') return null;
        return query(
            collection(firestore, 'independentTutorGroups'),
            where('tutorId', '==', request.id), // Assuming the user ID is stored on the request
            limit(1)
        )
    }, [firestore, request]);
    
    // We can't query by tutorId because the user isn't created yet.
    // The approval action will need to add the groupCode to the request doc, or we need another way to link.
    // Let's assume for now the approval process adds the `uniqueCode` to the `tutorRequest` doc for simplicity.

    if (!dni) {
        return (
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-destructive">DNI no encontrado</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Por favor, proporciona un DNI en la URL para verificar el estado de tu solicitud.</p>
                </CardContent>
            </Card>
        );
    }

    if (isLoadingRequest) {
        return (
             <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Buscando tu solicitud...</p>
            </div>
        );
    }
    
    if (!request) {
         return (
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle>Solicitud no encontrada</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>No pudimos encontrar una solicitud asociada a este DNI.</p>
                     <Button asChild className="mt-4">
                        <Link href="/">Volver al Inicio</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (request.status === 'pending') {
        return (
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <Clock className="w-16 h-16 mx-auto text-amber-500 animate-pulse" />
                    <CardTitle className="mt-4">Solicitud Pendiente</CardTitle>
                    <CardDescription>
                        Tu solicitud para ser Tutor Héroe está siendo revisada por nuestros administradores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Recibirás una notificación o un correo electrónico una vez que se procese. ¡Gracias por tu paciencia!</p>
                </CardContent>
            </Card>
        );
    }

    if (request.status === 'approved') {
        return (
             <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                    <CardTitle className="mt-4 text-2xl">¡Felicitaciones! Tu Solicitud fue Aprobada</CardTitle>
                    <CardDescription>
                        Tu cuenta de Tutor Héroe ha sido creada. Ahora puedes iniciar sesión y comenzar a guiar a tus estudiantes.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <p className="text-muted-foreground">Usa el siguiente código para que tus estudiantes se unan a tu grupo <span className="font-bold text-foreground">{request.groupName}</span>:</p>
                    <div className="p-4 bg-muted border border-dashed rounded-lg flex items-center justify-center gap-4">
                        <KeySquare className="w-8 h-8 text-primary" />
                        <code className="text-3xl font-bold text-primary tracking-widest">{request.uniqueCode}</code>
                    </div>
                     <Button asChild size="lg" className="w-full">
                        <Link href="/login">Ir a Iniciar Sesión</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

     if (request.status === 'rejected') {
        return (
            <Card className="w-full max-w-md text-center border-destructive">
                <CardHeader>
                    <XCircle className="w-16 h-16 mx-auto text-destructive" />
                    <CardTitle className="mt-4">Solicitud Rechazada</CardTitle>
                    <CardDescription>
                       Lamentablemente, tu solicitud para ser Tutor Héroe no pudo ser procesada en este momento.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Puedes volver a intentarlo o registrarte como tutor a través de una institución educativa si tienes un código.
                    </p>
                    <div className="flex gap-4">
                        <Button asChild variant="secondary" className="w-full">
                            <Link href="/#plans">Intentar de Nuevo</Link>
                        </Button>
                         <Button asChild className="w-full">
                            <Link href="/dashboard">Ver Planes</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return null;
}


export default function TutorRequestStatusPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
       <Suspense fallback={
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Cargando estado...</p>
            </div>
       }>
            <StatusDisplay />
       </Suspense>
    </main>
  );
}
