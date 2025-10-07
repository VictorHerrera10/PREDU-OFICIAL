'use client';

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { login, signInWithGoogle } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/provider';

const initialState = {
  message: null,
};

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, isUserLoading } = useUser();

  const [state, formAction] = useActionState(login, initialState);
  const searchParams = useSearchParams();
  const [googleState, googleFormAction] = useActionState(signInWithGoogle, initialState);

    useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: state.message,
      });
    }
  }, [state, toast]);

  useEffect(() => {
    if (googleState?.message) {
      toast({
        variant: 'destructive',
        title: 'Error de Google',
        description: googleState.message,
      });
    }
  }, [googleState, toast]);
  
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      toast({
        title: 'Información',
        description: message,
      });
    }
  }, [searchParams, toast]);


  return (
    <>
      <CardHeader className="p-0 mb-6 text-center">
        <CardTitle className="text-2xl font-bold text-primary">
          Bienvenido de Nuevo
        </CardTitle>
        <CardDescription>
          Ingresa tus credenciales para acceder a tu perfil.
        </CardDescription>
      </CardHeader>

      <div className="space-y-4">
        <form action={googleFormAction}>
          <Button variant="outline" className="w-full" type="submit">
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 381.5 512 244 512 110.1 512 0 401.9 0 265.8 0 129.8 110.1 20 244 20c66.5 0 123.9 24.5 166.9 65.3l-66.2 62.5C314.5 118.9 282.8 100 244 100c-78.2 0-141.6 63.4-141.6 141.4s63.4 141.4 141.6 141.4c86.2 0 120.3-64.2 124.9-95.2H244v-73.9h234.4c4.8 26.2 7.6 54.6 7.6 84.8z"
              ></path>
            </svg>
            Iniciar sesión con Google
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              O continuar con
            </span>
          </div>
        </div>
      </div>

      <form action={formAction} className="space-y-6 mt-6">
        <div className="space-y-2">
          <Label htmlFor="email">✉️ Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="estudiante@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">🔒 Contraseña</Label>
            <Link
              href="/forgot-password"
              passHref
              className="text-sm text-primary/80 hover:text-primary transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>

        <SubmitButton variant="secondary">Iniciar Sesión</SubmitButton>
      </form>

      <div className="mt-6 text-center text-sm">
        ¿Nuevo estudiante?{' '}
        <Link
          href="/register"
          passHref
          className="font-semibold text-primary/80 hover:text-primary transition-colors"
        >
          Comenzar
        </Link>
      </div>
    </>
  );
}
