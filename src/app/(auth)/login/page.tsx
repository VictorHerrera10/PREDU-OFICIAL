// @ts-nocheck
'use client'

import Link from 'next/link';
import { useFormState } from 'react-dom';
import { login } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/submit-button';
import { CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSearchParams } from 'next/navigation';

const initialState = {
  message: null,
};

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <>
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-bold text-primary">Welcome Back</CardTitle>
        <CardDescription>Enter your credentials to access your vault.</CardDescription>
      </CardHeader>

      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="player1@email.com" required />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" passHref className="text-sm text-primary/80 hover:text-primary transition-colors">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>

        {state?.message && (
          <Alert variant="destructive">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        {message && (
            <Alert variant="default" className="bg-primary/10 border-primary/30 text-primary-foreground">
                <AlertDescription>{message}</AlertDescription>
            </Alert>
        )}

        <SubmitButton variant="secondary">Login</SubmitButton>
      </form>

      <div className="mt-6 text-center text-sm">
        New Player?{' '}
        <Link href="/register" passHref className="font-semibold text-primary/80 hover:text-primary transition-colors">
          Start a New Game
        </Link>
      </div>
    </>
  );
}
