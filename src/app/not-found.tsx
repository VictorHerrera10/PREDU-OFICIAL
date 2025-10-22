'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Compass, ArrowLeft } from 'lucide-react';
import { WindowControls } from '@/components/window-controls';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/60 backdrop-blur-lg border-border/50 overflow-hidden">
          <WindowControls />
          <div className="p-6 md:p-8 text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                  <Compass className="w-16 h-16 text-primary animate-pulse" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">¡Ups! Te has perdido en el Campus Digital.</CardTitle>
              <CardDescription>
                La página que buscas no existe o fue movida a otra dimensión.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al Punto de Partida
                </Link>
              </Button>
            </CardContent>
          </div>
        </Card>
      </div>
    </main>
  );
}
