'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 1. Redirigir si el usuario ya está autenticado
  useEffect(() => {
    const redirectUrl = searchParams.get('redirect') || '/dashboard';
    if (!isUserLoading && user) {
      router.push(redirectUrl);
    }
  }, [user, isUserLoading, router, searchParams]);

  // 2. Manejar el envío del formulario de inicio de sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: '¡Qué bueno verte de nuevo! 👋',
        description: '¡Listo para empezar la lección!',
      });
      // La redirección se maneja en el useEffect de arriba
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error al iniciar sesión 😵',
        description:
          error.code === 'auth/invalid-credential'
            ? 'Las credenciales no son correctas. Por favor, inténtalo de nuevo.'
            : 'Ha ocurrido un error inesperado.',
      });
    }
  };

  // 3. Muestra un estado de carga mientras se verifica la autenticación
  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-primary-foreground animate-pulse">Verificando sesión...</p>
      </div>
    );
  }

  // 4. Si no hay usuario, mostrar el formulario de login
  return (
    <>
      <CardHeader className="p-0 mb-6 text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          ¡Bienvenido de Nuevo!
        </CardTitle>
        <CardDescription>
          Ingresa tus credenciales para continuar tu aprendizaje. 📚
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">✉️ Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="estudiante@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">🔒 Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full">Entrar al Aula 🎒</Button>
      </form>
      <div className="mt-4 text-center text-sm">
        ¿Aún no tienes cuenta?{' '}
        <Link
          href="/register"
          className="font-semibold text-primary/80 hover:text-primary transition-colors"
        >
          ¡Inscríbete aquí!
        </Link>
      </div>
       <div className="mt-2 text-center text-sm">
        <Link
            href="/forgot-password"
            className="text-xs text-primary/70 hover:text-primary transition-colors"
        >
            ¿Problemas para entrar?
        </Link>
       </div>
    </>
  );
}
