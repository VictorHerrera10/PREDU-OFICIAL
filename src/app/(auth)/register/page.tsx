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

const initialState = {
  message: null,
};

export default function RegisterPage() {
  const [state, formAction] = useFormState(register, initialState);

  return (
    <>
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-bold text-primary">New Game</CardTitle>
        <CardDescription>Create your account to start your adventure.</CardDescription>
      </CardHeader>
      
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" type="text" placeholder="Player1" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="player1@email.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>

        {state?.message && (
          <Alert variant="destructive">
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}
        
        <SubmitButton>Create Account</SubmitButton>
      </form>

      <div className="mt-6 text-center text-sm">
        Already a player?{' '}
        <Link href="/login" passHref className="font-semibold text-primary/80 hover:text-primary transition-colors">
          Continue Game
        </Link>
      </div>
    </>
  );
}
