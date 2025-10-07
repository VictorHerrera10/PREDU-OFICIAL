'use server';

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { initializeServerApp } from '@/firebase/server-init';
import { headers } from 'next/headers';

type State = {
  message?: string | null;
  success?: boolean;
  username?: string | null;
};

async function getAuthenticatedAppForUser() {
  const { auth, firestore } = await initializeServerApp();
  return { auth, firestore };
}

function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Las credenciales no son correctas. Por favor, revisa tu email y contraseña. 🤔';
    case 'auth/user-not-found':
      return 'No encontramos a ningún aventurero con ese correo. ¿Quizás te registraste con otro?';
    case 'auth/wrong-password':
      return '¡Contraseña incorrecta! Inténtalo de nuevo. 🤫';
    case 'auth/email-already-in-use':
      return '¡Ese email ya está en uso! Parece que ya tienes una cuenta. Intenta iniciar sesión. 😉';
    case 'auth/weak-password':
      return 'Tu contraseña es muy débil. ¡Necesitas al menos 6 caracteres para proteger tu cuenta! 🛡️';
    case 'auth/operation-not-allowed':
      return 'Esta operación no está permitida. Contacta a soporte si crees que es un error.';
    case 'auth/popup-closed-by-user':
      return 'La ventana emergente fue cerrada antes de terminar. ¡No te rindas! Inténtalo de nuevo.';
    default:
      return 'Ocurrió un error inesperado en el castillo. Por favor, inténtalo de nuevo más tarde. 🏰';
  }
}

export async function register(prevState: State, formData: FormData): Promise<State> {
  const { auth, firestore } = await getAuthenticatedAppForUser();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, { displayName: username });

    const userProfileRef = doc(firestore, 'users', user.uid);
    const userProfileData = {
      id: user.uid,
      username: username,
      email: user.email,
      creationDate: serverTimestamp(),
      lastLogin: serverTimestamp(),
    };
    
    await setDoc(userProfileRef, userProfileData);

    return { success: true, username: username };

  } catch (e: any) {
    return { message: getFirebaseErrorMessage(e.code) };
  }
}

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
      `${refererUrl.pathname}?message=Si existe una cuenta para este correo, hemos enviado un pergamino mágico 📜 para restablecer tu contraseña.`
    );
  } else {
    redirect(
      '/login?message=Si existe una cuenta para este correo, hemos enviado un pergamino mágico 📜 para restablecer tu contraseña.'
    );
  }
}
