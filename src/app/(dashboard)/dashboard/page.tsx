'use client';

import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { LogoutButton } from '@/components/logout-button';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap, School } from 'lucide-react';
import Link from 'next/link';
import { TutorRegistrationForm } from '@/components/tutor-registration-form';
import { doc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import { updateUserRole } from '@/app/actions';
import { StudentLoader } from '@/components/student-loader';
import { useToast } from '@/hooks/use-toast';
import { TutorAdminLoader } from '@/components/tutor-admin-loader';

type UserProfile = {
  id: string;
  role?: 'student' | 'tutor' | 'admin';
  dni?: string;
  tutorVerified?: boolean;
};

type TutorRequest = {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  notifiedRejected?: boolean;
  dni: string; // Ensure DNI is part of the request type
};

function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  // Query for tutor requests using the user's ID
  const tutorRequestQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'tutorRequests'), where('userId', '==', user.uid));
  }, [user, firestore]);

  const { data: tutorRequests, isLoading: isRequestLoading } = useCollection<TutorRequest>(tutorRequestQuery);
  const tutorRequest = tutorRequests?.[0];

  useEffect(() => {
    if (isProfileLoading || isRequestLoading || !userProfile) {
      return;
    }

    // 1. Check for an existing role first (most common case)
    if (userProfile.role) {
      if (userProfile.role === 'admin') redirect('/admin');
      if (userProfile.role === 'student') redirect('/student-dashboard');
      if (userProfile.role === 'tutor') {
        // NEW: Check if the tutor is verified
        if (userProfile.tutorVerified === false) {
           redirect('/tutor-verification');
           return;
        }
        redirect('/tutor-dashboard');
        return;
      }
    }

    // 2. If no role, check for tutor requests
    if (tutorRequest) {
      if (tutorRequest.status === 'pending') {
        redirect(`/tutor-request-status?dni=${tutorRequest.dni}`);
        return;
      }

      if (tutorRequest.status === 'rejected' && !tutorRequest.notifiedRejected) {
        toast({
          variant: "destructive",
          title: "Solicitud de Tutor Rechazada",
          description: "Tu solicitud anterior para ser Tutor Héroe no fue aprobada. Puedes intentarlo de nuevo o elegir otro rol.",
        });
        const requestRef = doc(firestore, 'tutorRequests', tutorRequest.id);
        updateDoc(requestRef, { notifiedRejected: true });
      }
    }

    // 3. If no role and no pending/approved request, the initial check is complete.
    setInitialCheckComplete(true);

  }, [isProfileLoading, isRequestLoading, userProfile, tutorRequest, router, toast, firestore]);
  
  const handleSetRole = async (role: 'student' | 'tutor') => {
    if (user) {
      await updateUserRole(user.uid, role);
    }
  };
  
  if (isProfileLoading || isRequestLoading || !initialCheckComplete) {
    return <TutorAdminLoader loadingText="Cargando tu aula..." />;
  }

  return (
    <>
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <Logo />
        <LogoutButton />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl text-center">
          <CardHeader className="mb-8">
            <CardTitle className="text-3xl md:text-4xl font-bold text-primary">
              ¡Bienvenido al Aula, {user?.displayName || 'Usuario'}! 🎓
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground mt-2">
              Para continuar, elige tu camino. ¿Eres un estudiante listo para aprender o un tutor listo para guiar?
            </CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-border text-left hover:border-primary/50 transition-all transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <GraduationCap className="w-10 h-10 text-primary" />
                  <div>
                    <CardTitle className="text-2xl font-bold">Soy Estudiante</CardTitle>
                    <CardDescription>Descubre tu vocación y prepárate para el futuro.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Accede a herramientas, tests vocacionales y contenido exclusivo para empezar tu viaje profesional.
                </p>
                <form action={() => handleSetRole('student')}>
                  <Button className="w-full" type="submit">
                    Entrar como Estudiante <ArrowRight className="ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Tutor Card */}
            <Card className="bg-card/80 backdrop-blur-sm border-border text-left hover:border-primary/50 transition-all transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <School className="w-10 h-10 text-primary" />
                  <div>
                    <CardTitle className="text-2xl font-bold">Soy Tutor</CardTitle>
                    <CardDescription>Accede a herramientas para guiar a tus estudiantes.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                 <p className="text-muted-foreground mb-4">
                  Regístrate con tu código de acceso para gestionar a tus estudiantes y ver su progreso.
                </p>
                <TutorRegistrationForm>
                  <Button variant="secondary" className="w-full">
                    Registrarme como Tutor <ArrowRight className="ml-2" />
                  </Button>
                </TutorRegistrationForm>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}

export default DashboardPage;
