'use client';

import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { LogoutButton } from '@/components/logout-button';
import { Button } from '@/components/ui/button';
import { ArrowRight, GraduationCap, School, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { TutorRegistrationForm } from '@/components/tutor-registration-form';
import { doc } from 'firebase/firestore';
import { useEffect, useMemo } from 'react';
import { redirect } from 'next/navigation';
import { updateUserRole } from '@/app/actions';

function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const isAdmin = user?.email === 'admin@predu.com';

  const userProfileRef = useMemo(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile, isLoading } = useDoc(userProfileRef);

  useEffect(() => {
    if (!isLoading && userProfile?.role) {
      if (userProfile.role === 'student') {
        redirect('/student-dashboard');
      } else if (userProfile.role === 'tutor') {
        redirect('/tutor-dashboard');
      }
    }
  }, [isLoading, userProfile]);

  const handleSetRole = async (role: 'student' | 'tutor') => {
    if (user) {
      await updateUserRole(user.uid, role);
    }
  };
  
  if (isLoading || !userProfile || userProfile.role) {
    return (
       <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando tu aula...</p>
       </div>
    )
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
                <Button className="w-full" onClick={() => handleSetRole('student')}>
                  Entrar como Estudiante <ArrowRight className="ml-2" />
                </Button>
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
           {isAdmin && (
            <div className="mt-8">
               <Link href="/admin" passHref>
                  <Button variant="outline" className="text-primary hover:text-primary">
                    Panel de Administrador
                  </Button>
                </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default DashboardPage;
