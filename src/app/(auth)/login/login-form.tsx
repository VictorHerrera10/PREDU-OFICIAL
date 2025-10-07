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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Eye, EyeOff, Rocket } from 'lucide-react';

export default function LoginForm() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNotRegisteredAlert, setShowNotRegisteredAlert] = useState(false);

  useEffect(() => {
    const redirectUrl = searchParams.get('redirect') || '/dashboard';
    if (!isUserLoading && user) {
      router.push(redirectUrl);
    }
  }, [user, isUserLoading, router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setShowNotRegisteredAlert(false);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: '¡Qué bueno verte de nuevo! 👋',
        description: '¡Listo para empezar la lección!',
      });
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setShowNotRegisteredAlert(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al iniciar sesión 😵',
          description: 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
        });
      }
    }
  };
  
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-primary-foreground animate-pulse">Verificando sesión...</p>
      </div>
    );
  }

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
      
      {showNotRegisteredAlert ? (
        <Alert className="border-primary/50 bg-card/70 text-center">
            <Rocket className="h-4 w-4 -translate-y-0.5" />
            <AlertTitle className="font-bold text-lg text-primary">¡Hola, futuro estudiante! 🚀</AlertTitle>
            <AlertDescription className="text-muted-foreground mb-4">
                Parece que aún no estás en nuestra lista. ¡No te preocupes! Regístrate para empezar tu aventura vocacional.
            </AlertDescription>
             <Button onClick={() => router.push('/register')}>
                ¡Quiero Registrarme!
            </Button>
        </Alert>
      ) : (
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
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-1/2 right-2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-primary-foreground"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? <EyeOff /> : <Eye />}
                <span className="sr-only">{showPassword ? 'Ocultar' : 'Mostrar'} contraseña</span>
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full">Entrar al Aula 🎒</Button>
        </form>
      )}

      <div className="mt-4 text-center text-sm">
        {showNotRegisteredAlert ? (
             <Button variant="link" onClick={() => setShowNotRegisteredAlert(false)} className="text-primary/80">
                Volver a intentar
            </Button>
        ) : (
            <>
                ¿Aún no tienes cuenta?{' '}
                <Link
                href="/register"
                className="font-semibold text-primary/80 hover:text-primary transition-colors"
                >
                ¡Inscríbete aquí!
                </Link>
            </>
        )}
       
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
