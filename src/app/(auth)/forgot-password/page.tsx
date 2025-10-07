'use client'

import Link from 'next/link';
import { useActionState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { forgotPassword } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: null,
};

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [state, formAction] = useActionState(forgotPassword, initialState);
  const searchParams = useSearchParams();
  const formSubmitted = searchParams.get('message');

  useEffect(() => {
    if (state?.message) {
      toast({
        variant: 'destructive',
        title: 'Ups... Algo salió mal 😵',
        description: state.message,
      });
    }
  }, [state, toast]);

  useEffect(() => {
    if (formSubmitted) {
      toast({
        title: '✉️ ¡Petición enviada!',
        description: formSubmitted,
      });
    }
  }, [formSubmitted, toast]);


  return (
    <>
      <CardHeader className="p-0 mb-6 text-center">
        <CardTitle className="text-2xl font-bold text-primary">🤔 ¿Olvidaste tu Contraseña?</CardTitle>
        <CardDescription>No te preocupes, ¡a todos nos pasa! Te enviaremos instrucciones para recuperarla. 🚀</CardDescription>
      </CardHeader>
      
      {formSubmitted ? (
        <div className="text-center text-primary-foreground">
            <p>{formSubmitted}</p>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">✉️ Email</Label>
            <Input id="email" name="email" type="email" placeholder="estudiante@email.com" required />
          </div>
          
          <SubmitButton variant="secondary">Enviar Instrucciones 📬</SubmitButton>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        <Link href="/login" passHref className="font-semibold text-primary/80 hover:text-primary transition-colors flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver a Iniciar Sesión
        </Link>
      </div>
    </>
  );
}
