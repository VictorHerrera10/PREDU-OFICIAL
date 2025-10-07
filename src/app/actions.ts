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
import { initializeFirebase } from '@/firebase';
import { headers } from 'next/headers';

async function getAuthenticatedAppForUser() {
  const { auth } = initializeFirebase();
  return { auth };
}

export async function login(prevState: any, formData: FormData) {
  const { auth } = await getAuthenticatedAppForUser();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (e: any) {
    return { message: e.message };
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
    return { message: e.message };
  }
  redirect('/dashboard');
}

export async function forgotPassword(prevState: any, formData: FormData) {
  const { auth } = await getAuthenticatedAppForUser();
  const email = formData.get('email') as string;

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (e: any) {
    return { message: e.message };
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

export async function signInWithGoogle() {
  const { auth } = await getAuthenticatedAppForUser();
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (e: any) {
    return { message: e.message };
  }
  redirect('/dashboard');
}
