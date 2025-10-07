// @ts-nocheck
'use client'

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { register } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const initialState = {
  message: null,
};

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, initialState);

  return (
    <>
      <CardHeader className="p-0 mb-6 text-center">
        <CardTitle className="text-2xl font-bold text-primary">Crear Cuenta</CardTitle>
        <CardDescription>Crea tu cuenta para comenzar tu aventura.</CardDescription>
      </CardHeader>
      
      <div className="space-y-4">
        <Button variant="outline" className="w-full">
           <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.1 512 0 401.9 0 265.8 0 129.8 110.1 20 244 20c66.5 0 123.9 24.5 166.9 65.3l-66.2 62.5C314.5 118.9 282.8 100 244 100c-78.2 0-141.6 63.4-141.6 141.4s63.4 141.4 141.6 141.4c86.2 0 120.3-64.2 124.9-95.2H244v-73.9h234.4c4.8 26.2 7.6 54.6 7.6 84.8z"></path></svg>
          Registrarse con Google
        </Button>

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

      <form action={formAction} className="space-y-4 mt-6">
        <div className="space-y-2">
          <Label htmlFor="username">🧑‍🎓 Nombre de usuario</Label>
          <Input id="username" name="username" type="text" placeholder="Estudiante1" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">✉️ Email</Label>
          <Input id="email" name="email" type="email" placeholder="estudiante@email.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">🔒 Contraseña</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        {state?.message && (
          <Alert variant="destructive">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        
        <SubmitButton>Crear Cuenta</SubmitButton>
      </form>

      <div className="mt-6 text-center text-sm">
        ¿Ya eres estudiante?{' '}
        <Link href="/login" passHref className="font-semibold text-primary/80 hover:text-primary transition-colors">
          Continuar
        </Link>
      </div>
    </>
  );
}
