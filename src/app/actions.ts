'use server';

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { initializeServerApp } from '@/firebase/server-init';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

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
      return 'Las credenciales no son correctas. Revisa tus apuntes y vuelve a intentarlo. 🤔';
    case 'auth/user-not-found':
      return 'No encontramos a ningún estudiante con ese correo. ¿Quizás te inscribiste con otro?';
    case 'auth/wrong-password':
      return '¡Contraseña incorrecta! Inténtalo de nuevo. 🤫';
    case 'auth/email-already-in-use':
      return '¡Ese email ya está en uso! Parece que ya estás en la lista. Intenta iniciar sesión. 😉';
    case 'auth/weak-password':
      return 'Tu contraseña es muy débil. ¡Necesitas al menos 6 caracteres para proteger tu mochila digital! 🎒';
    case 'auth/operation-not-allowed':
      return 'Esta operación no está permitida. Habla con el director si crees que es un error.';
    default:
      return 'Ocurrió un error inesperado en el servidor de la escuela. Por favor, inténtalo de nuevo más tarde. 🏫';
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
    
    // Assign role based on email
    let role: 'admin' | 'student' | 'tutor' | null = null;
    if (email === 'admin@predu.com') {
      role = 'admin';
    }

    const userProfileData = {
      id: user.uid,
      username: username,
      email: user.email,
      creationDate: serverTimestamp(),
      lastLogin: serverTimestamp(),
      role: role, // Assign role
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
      `${refererUrl.pathname}?message=Si existe una cuenta para este correo, hemos enviado un mensaje 🧑‍🏫 para restablecer tu contraseña.`
    );
  } else {
    redirect(
      '/login?message=Si existe una cuenta para este correo, hemos enviado un mensaje 🧑‍🏫 para restablecer tu contraseña.'
    );
  }
}

export async function updateUserRole(userId: string, role: 'student' | 'tutor') {
  const { firestore } = await getAuthenticatedAppForUser();
  const userProfileRef = doc(firestore, 'users', userId);

  try {
    await updateDoc(userProfileRef, { role });
    revalidatePath('/dashboard');
    if (role === 'student') {
      redirect('/student-dashboard');
    } else {
      redirect('/tutor-dashboard');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    // Handle the error appropriately
    return { message: 'No se pudo actualizar el rol del usuario.' };
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  const username = formData.get('username') as string;
  const role = formData.get('role') as string;

  if (!username || !role) {
    return { success: false, message: 'El nombre de usuario y el rol son obligatorios.' };
  }

  const userProfileRef = doc(firestore, 'users', userId);

  try {
    await updateDoc(userProfileRef, {
      username,
      role,
    });
    revalidatePath('/admin');
    return { success: true, username: username };
  } catch (error: any) {
    console.error('Error updating user:', error);
    return { success: false, message: 'No se pudo actualizar el usuario. ' + error.message };
  }
}
