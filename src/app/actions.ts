'use server';

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { redirect } from 'next/navigation';
import { initializeServerApp } from '@/firebase/server-init';
import { headers } from 'next/headers';

async function getAuthenticatedAppForUser() {
  const { auth } = await initializeServerApp();
  return { auth };
}

function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Las credenciales proporcionadas no son válidas o han expirado. Por favor, inténtalo de nuevo.';
    case 'auth/user-not-found':
      return 'No se encontró ninguna cuenta con esta dirección de correo electrónico.';
    case 'auth/wrong-password':
      return 'La contraseña es incorrecta. Por favor, inténtalo de nuevo.';
    case 'auth/email-already-in-use':
      return 'Esta dirección de correo electrónico ya está en uso por otra cuenta.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres.';
    case 'auth/operation-not-allowed':
      return 'El inicio de sesión con correo electrónico y contraseña no está habilitado.';
    case 'auth/popup-closed-by-user':
      return 'La ventana de inicio de sesión fue cerrada antes de completar la operación.';
    default:
      return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.';
  }
}

export async function login(prevState: any, formData: FormData) {
  const { auth } = await getAuthenticatedAppForUser();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e: any) {
    return { message: getFirebaseErrorMessage(e.code) };
  }
  redirect('/dashboard');
}

export async function register(prevState: any, formData: FormData) {
  const { auth } = await getAuthenticatedAppForUser();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    // You might want to save the username to Firestore here
  } catch (e: any) {
    return { message: getFirebaseErrorMessage(e.code) };
  }
  redirect('/dashboard');
}

export async function forgotPassword(prevState: any, formData: FormData) {
  const { auth } = await getAuthenticatedAppForUser();
  const email = formData.get('email') as string;

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (e: any) {
    return { message: getFirebaseErrorMessage(e.code) };
  }

  const referer = headers().get('referer');
  const refererUrl = referer ? new URL(referer) : null;

  if (refererUrl) {
    redirect(
      `${refererUrl.pathname}?message=Si existe una cuenta para este correo, se ha enviado un enlace para restablecer la contraseña.`
    );
  } else {
    redirect(
      '/login?message=Si existe una cuenta para este correo, se ha enviado un enlace para restablecer la contraseña.'
    );
  }
}

export async function logout() {
  const { auth } = await getAuthenticatedAppForUser();
  await signOut(auth);
  redirect('/login');
}

export async function signInWithGoogle(prevState: any, formData: FormData) {
  const { auth } = await getAuthenticatedAppForUser();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
  } catch (e: any) {
    return { message: getFirebaseErrorMessage(e.code) };
  }
  redirect('/dashboard');
}
