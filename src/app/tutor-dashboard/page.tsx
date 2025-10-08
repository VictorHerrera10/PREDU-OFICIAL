'use client';

import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserNav } from '@/components/user-nav';
import { useUser } from '@/firebase';

function TutorDashboardPage() {
  const { user } = useUser();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-background/80 backdrop-blur-sm border-b">
        <Logo />
        <UserNav />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl text-center bg-card/80 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              ¡Hola, Tutor {user?.displayName || ''}! 🧑‍🏫
            </CardTitle>
             <CardDescription className="text-lg text-muted-foreground mt-2">
              Bienvenido a tu centro de control para guiar a tus estudiantes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground mt-4">
             Aquí encontrarás las herramientas para gestionar a tus estudiantes y ver su progreso. ¡Vamos a empezar! 🚀
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default TutorDashboardPage;
