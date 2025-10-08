'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Users, Mail, Phone, MapPin } from 'lucide-react';

type Institution = {
  id: string;
  name: string;
  address: string;
  contactEmail: string;
  directorName: string;
  studentLimit: number;
  tutorLimit: number;
  logoUrl?: string;
};

type UserProfile = {
    institutionId?: string;
};

export default function InstitutionView() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userProfileRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'users', user.uid);
    }, [user, firestore]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

    const institutionRef = useMemo(() => {
        if (!userProfile?.institutionId || !firestore) return null;
        return doc(firestore, 'institutions', userProfile.institutionId);
    }, [userProfile, firestore]);

    const { data: institution, isLoading: isInstitutionLoading } = useDoc<Institution>(institutionRef);

    if (isProfileLoading || isInstitutionLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-5 w-1/3" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                </CardContent>
            </Card>
        )
    }

    if (!institution) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle>Información del Colegio</CardTitle>
                    <CardDescription>
                    No se encontró información de la institución.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Parece que no estás asociado a ninguna institución o no se pudieron cargar los datos.
                    </p>
                </CardContent>
            </Card>
        )
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Building className="text-primary"/> {institution.name}</CardTitle>
        <CardDescription>
          Información clave sobre tu institución educativa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">{institution.address}</span>
        </div>
        <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">{institution.contactEmail}</span>
        </div>
         <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">Director: {institution.directorName}</span>
        </div>
        <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-muted-foreground" />
            <span className="text-foreground">Límites: {institution.studentLimit} Estudiantes / {institution.tutorLimit} Tutores</span>
        </div>
      </CardContent>
    </Card>
  );
}
