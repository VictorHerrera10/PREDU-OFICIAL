'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Users, Mail, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import StudentsList from './StudentsView'; // Import the new component

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
    id: string;
    username: string;
    email: string;
    tutorDetails?: {
        roleInInstitution: string;
    };
    institutionId?: string;
};

function TutorsList({ institutionId }: { institutionId: string }) {
    const firestore = useFirestore();

    const tutorsQuery = useMemo(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'users'), 
            where('institutionId', '==', institutionId),
            where('role', '==', 'tutor')
        );
    }, [firestore, institutionId]);

    const { data: tutors, isLoading } = useCollection<UserProfile>(tutorsQuery);

    if (isLoading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }
    
    if (!tutors || tutors.length === 0) {
        return <p className="text-sm text-muted-foreground text-center py-4">No hay tutores registrados para esta institución.</p>
    }

    return (
        <div className="space-y-3">
            {tutors.map(tutor => (
                <div key={tutor.id} className="flex items-center gap-4 p-3 border rounded-lg bg-background/50">
                    <Avatar>
                        <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${tutor.username}`} />
                        <AvatarFallback>{tutor.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-semibold">{tutor.username}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {tutor.email}</p>
                    </div>
                    {tutor.tutorDetails?.roleInInstitution && (
                         <Badge variant="secondary" className="flex items-center gap-1.5">
                            <Briefcase className="h-3 w-3"/>
                            {tutor.tutorDetails.roleInInstitution}
                        </Badge>
                    )}
                </div>
            ))}
        </div>
    );
}

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-5 w-1/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-5 w-1/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            </div>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Building className="text-primary"/> {institution.name}</CardTitle>
                <CardDescription>
                Información clave sobre tu institución educativa.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </CardContent>
        </Card>

         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Tutores</CardTitle>
                <CardDescription>
                    Colegas registrados en tu misma institución.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <TutorsList institutionId={institution.id} />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><GraduationCap className="text-primary"/> Estudiantes</CardTitle>
                <CardDescription>
                    Estudiantes registrados en la institución.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <StudentsList />
            </CardContent>
        </Card>
    </div>
  );
}
