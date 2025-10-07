'use client';
import { logout } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { LogOut, Terminal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';

function DashboardPage() {
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      toast({
        title: `¡Bienvenido, ${user.displayName || 'Estudiante'}!`,
        description: 'Has iniciado sesión correctamente.',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, toast]);

  return (
    <>
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
        <Logo />
        <form action={logout}>
          <Button
            variant="ghost"
            type="submit"
            className="text-muted-foreground hover:text-primary-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl text-center bg-card/80 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              Bienvenido al Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground mt-4">
              Aquí comienza tu aventura.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default DashboardPage;
