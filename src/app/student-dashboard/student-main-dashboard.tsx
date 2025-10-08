'use client';

import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogoutButton } from '@/components/logout-button';
import { BrainCircuit, Compass, Home } from 'lucide-react';
import { User } from 'firebase/auth';

type Props = {
    user: User | null;
};

export function StudentMainDashboard({ user }: Props) {
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
                ¡Hola de nuevo, {user?.displayName || 'Estudiante'}! 🚀
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-2">
                Este es tu centro de mando para el éxito. ¿Qué quieres hacer hoy?
                </CardDescription>
            </CardHeader>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <Card className="bg-card/80 backdrop-blur-sm border-border text-left hover:border-primary/50 transition-all transform hover:-translate-y-1">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                        <Home className="w-10 h-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl font-bold">Inicio</CardTitle>
                        </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                        Tu resumen, notificaciones y próximos pasos.
                        </p>
                    </CardContent>
                </Card>

                 <Card className="bg-card/80 backdrop-blur-sm border-border text-left hover:border-primary/50 transition-all transform hover:-translate-y-1">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                        <Compass className="w-10 h-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl font-bold">Predicción Académica</CardTitle>
                        </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                        Realiza tests para descubrir tu vocación profesional.
                        </p>
                    </CardContent>
                </Card>

                 <Card className="bg-card/80 backdrop-blur-sm border-border text-left hover:border-primary/50 transition-all transform hover:-translate-y-1">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                        <BrainCircuit className="w-10 h-10 text-primary" />
                        <div>
                            <CardTitle className="text-2xl font-bold">Predicción Psicológica</CardTitle>
                        </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                        Entiende tus fortalezas y áreas de mejora personal.
                        </p>
                    </CardContent>
                </Card>

            </div>
        </div>
      </main>
    </>
  );
}
