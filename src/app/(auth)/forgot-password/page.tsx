import { Suspense } from 'react';
import ForgotPasswordForm from './forgot-password-form';

function ForgotPasswordLoading() {
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <p className="text-primary-foreground animate-pulse">Cargando...</p>
        </div>
    )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
