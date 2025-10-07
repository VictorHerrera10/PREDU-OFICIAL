'use client';

import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { LogoutButton } from '@/components/logout-button';

function DashboardPage() {
  const { user } = useUser();

  return (
    <>
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <Logo />
        <LogoutButton />
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl text-center bg-card/80 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              Bienvenido al Dashboard, {user?.displayName || 'Estudiante'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground mt-4">
              Aquí comienza tu aventura. ¡Has iniciado sesión correctamente!
            </p>
            <p className='text-sm text-muted-foreground'>Tu UID es: {user?.uid}</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default DashboardPage;
