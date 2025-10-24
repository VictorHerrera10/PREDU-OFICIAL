'use server';

import { sendPasswordResetEmail } from 'firebase/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser, getFirebaseErrorMessage } from './utils';

export async function forgotPassword(prevState: any, formData: FormData) {
  const { auth } = await getAuthenticatedAppForUser();
  const email = formData.get('email') as string;

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (e: any) {
    return { message: getFirebaseErrorMessage(e.code) };
  }

  const referer = (await headers()).get('referer');
  const refererUrl = referer ? new URL(referer) : null;

  if (refererUrl) {
    redirect(
      `${refererUrl.pathname}?message=Si existe una cuenta para este correo, hemos enviado un mensaje 🧑‍🏫 para restablecer tu contraseña.`
    );
  } else {
    redirect(
      '/login?message=Si existe una cuenta para este correo, hemos enviado un mensaje 🧑‍🏫 para restablecer tu contraseña.'
    );
  }
}
