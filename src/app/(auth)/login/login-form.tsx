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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';

// Moved from actions.ts to avoid server-only export issues
function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Las credenciales no son correctas. Revisa tus apuntes y vuelve a intentarlo. 🤔';
    case 'auth/user-not-found': // This is now often covered by invalid-credential
      return 'No encontramos a ningún estudiante con ese correo.';
    case 'auth/wrong-password': // This is also now often covered by invalid-credential
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
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);

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
    setShowRegisterDialog(false);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: '¡Qué bueno verte de nuevo! 👋',
        description: '¡Listo para empezar la lección!',
      });
      
      setTimeout(() => {
        addNotification({
          type: 'welcome',
          title: '¡Bienvenido a Predu!',
          description: 'Completa tus tests para descubrir tu ruta profesional.',
          emoji: '🚀'
        });
      }, 6000);

    } catch (error: any) {
       const errorCode = error.code;
       const errorMessage = getFirebaseErrorMessage(errorCode);
      
       if (errorCode === 'auth/invalid-credential') {
            // Heuristic: If password field is filled, it's likely a wrong password. 
            // If it's empty, it's likely a user-not-found scenario.
            if (password) {
                 toast({
                    variant: 'destructive',
                    title: 'Credenciales Incorrectas 😵',
                    description: errorMessage,
                });
            } else {
                setError(errorMessage);
                setShowRegisterDialog(true);
            }
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
      
      <AlertDialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertCircle /> ¡Usuario no Encontrado!</AlertDialogTitle>
            <AlertDialogDescription>
                No encontramos una cuenta con el correo electrónico que ingresaste. ¿Te gustaría crear una cuenta nueva?
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/register')}>
                Registrarse Ahora
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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