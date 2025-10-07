// @ts-nocheck
'use client'

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { forgotPassword } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft } from 'lucide-react';

const initialState = {
  message: null,
};

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(forgotPassword, initialState);
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <>
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-bold text-primary">Forgot Password</CardTitle>
        <CardDescription>No worries, we'll send you reset instructions.</CardDescription>
      </CardHeader>
      
      {message ? (
        <Alert variant="default" className="bg-primary/10 border-primary/30 text-primary-foreground">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : (
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="player1@email.com" required />
          </div>

          {state?.message && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}
          
          <SubmitButton variant="secondary">Send Instructions</SubmitButton>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        <Link href="/login" passHref className="font-semibold text-primary/80 hover:text-primary transition-colors flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </>
  );
}
