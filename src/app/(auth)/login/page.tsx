'use client';

import { Suspense } from 'react';
import LoginForm from './login-form';

function LoginLoading() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-primary-foreground animate-pulse">Cargando...</p>
        </div>
    )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
}
