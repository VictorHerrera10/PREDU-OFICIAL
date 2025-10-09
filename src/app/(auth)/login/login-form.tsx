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
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';

// Moved from actions.ts to avoid server-only export issues
function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Las credenciales no son correctas. Revisa tus apuntes y vuelve a intentarlo. 🤔';
    case 'auth/user-not-found': // Although invalid-credential is more common now
      return 'No encontramos a ningún estudiante con ese correo.';
    case 'auth/wrong-password':
      return '¡Contraseña incorrecta! Inténtalo de nuevo. 🤫';
    case 'auth/email-already-in-use':
      return '¡Ese email ya está en uso! Parece que ya estás en la lista. Intenta iniciar sesión. 😉';
    case 'auth/weak-password':
      return 'Tu contraseña es muy débil. ¡Necesitas al menos 6 caracteres para proteger tu mochila digital! 🎒';
    case 'auth/operation-not-allowed':
      return 'Esta operación no está permitida. Habla con el director si crees que es un error.';
    default:
      return 'Ocurrió un error inesperado en el servidor de la escuela. Por favor, inténtalo de nuevo más tarde. 🏫';
  }
}

export default function LoginForm() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const { addNotification } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRegisterSuggestion, setShowRegisterSuggestion] = useState(false);

  useEffect(() => {
    const redirectUrl = searchParams.get('redirect') || '/dashboard';
    if (!isUserLoading && user) {
      router.push(redirectUrl);
    }
  }, [user, isUserLoading, router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) return;

    setError(null);
    setShowRegisterSuggestion(false);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: '¡Qué bueno verte de nuevo! 👋',
        description: '¡Listo para empezar la lección!',
      });
      
      // Welcome Notification
      setTimeout(() => {
        addNotification({
          title: '¡Bienvenido a Predu!',
          description: 'Completa tus tests para descubrir tu ruta profesional.',
          emoji: '🚀'
        });
      }, 6000);

    } catch (error: any) {
       const errorCode = error.code;
       const errorMessage = getFirebaseErrorMessage(errorCode);

      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/user-not-found') {
        setError(errorMessage);
        setShowRegisterSuggestion(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al iniciar sesión 😵',
          description: errorMessage,
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
      
      {showRegisterSuggestion && error && (
          <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Usuario no encontrado</AlertTitle>
              <AlertDescription>
                  {error}{' '}
                  <Link href="/register" className="font-bold underline hover:text-destructive-foreground">
                      ¿Quieres registrarte?
                  </Link>
              </AlertDescription>
          </Alert>
      )}

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
