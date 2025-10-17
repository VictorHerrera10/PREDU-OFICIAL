'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, query, where, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

type IndependentTutorGroup = {
  id: string;
  name: string;
  studentLimit?: number;
  tutorLimit?: number;
  tutorId: string;
};

export default function GroupView() {
    const { user } = useUser();
    const firestore = useFirestore();

    const groupQuery = useMemo(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'independentTutorGroups'),
            where('tutorId', '==', user.uid),
            limit(1)
        );
    }, [user, firestore]);
    
    const { data: groups, isLoading } = useCollection<IndependentTutorGroup>(groupQuery);
    const group = groups?.[0];

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-5 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                </CardContent>
            </Card>
        )
    }

    if (!group) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Información del Grupo</CardTitle>
                    <CardDescription>
                    No se encontró información de tu grupo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Parece que no has creado un grupo o no se pudieron cargar los datos.
                    </p>
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> {group.name}</CardTitle>
        <CardDescription>
          Información clave sobre tu grupo de tutoría.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">Límites: {group.studentLimit || 0} Estudiantes / {group.tutorLimit || 1} Tutores</span>
        </div>
      </CardContent>
    </Card>
  );
}
