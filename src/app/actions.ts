'use server';

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  addDoc,
  collection,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc,
} from 'firebase/firestore';
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
      isProfileComplete: false, // New user, profile is not complete
      role: role, // Assign role
    };
    
    await setDoc(userProfileRef, userProfileData);

    // Create notification for admin
    await addDoc(collection(firestore, 'notifications'), {
        type: 'new_user',
        title: 'Nuevo Usuario Registrado',
        description: `El usuario ${username} (${email}) se ha unido.`,
        emoji: '🧑‍🎓',
        createdAt: serverTimestamp(),
        read: false,
    });


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
    } else if (role === 'tutor'){
      redirect('/tutor-dashboard');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    // Handle the error appropriately
    return { message: 'No se pudo actualizar el rol del usuario.' };
  }
}


export async function registerTutor(prevState: any, formData: FormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  
  const userId = formData.get('userId') as string;
  const accessCode = formData.get('accessCode') as string;
  const institutionId = formData.get('institutionId') as string;
  const roleInInstitution = formData.get('roleInInstitution') as string;

  if (!userId || !accessCode || !institutionId || !roleInInstitution) {
    return { success: false, message: 'Faltan datos obligatorios.' };
  }

  try {
    // 1. Validate institution and code
    const institutionRef = doc(firestore, 'institutions', institutionId);
    const institutionSnap = await getDoc(institutionRef);

    if (!institutionSnap.exists()) {
      return { success: false, message: 'La institución seleccionada no es válida.' };
    }

    const institutionData = institutionSnap.data();
    if (institutionData.uniqueCode !== accessCode) {
      return { success: false, message: 'El código de acceso no coincide con la institución seleccionada. ❌' };
    }

    // 2. Check tutor limit
    const tutorsQuery = query(collection(firestore, 'users'), where('institutionId', '==', institutionId));
    const tutorsSnap = await getDocs(tutorsQuery);
    const currentTutorCount = tutorsSnap.size;

    if (currentTutorCount >= institutionData.tutorLimit) {
      return { success: false, message: 'El límite de tutores para esta institución ha sido alcanzado. Contacta al administrador. 🚫' };
    }

    // 3. Update user profile
    const userProfileRef = doc(firestore, 'users', userId);
    await updateDoc(userProfileRef, {
      role: 'tutor',
      institutionId: institutionId,
      tutorDetails: {
        roleInInstitution: roleInInstitution,
      },
    });

    revalidatePath('/dashboard');
    return { success: true };

  } catch (error: any) {
    console.error('Error registering tutor:', error);
    return { success: false, message: 'No se pudo completar el registro de tutor. ' + error.message };
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

// --- Institution Actions ---
function generateUniqueCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}


export async function createInstitution(formData: FormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  
  const data = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    contactEmail: formData.get('contactEmail') as string,
    region: formData.get('region') as string,
    level: formData.get('level') as string,
    directorName: formData.get('directorName') as string,
    directorEmail: formData.get('directorEmail') as string,
    directorPhone: formData.get('directorPhone') as string,
    teachingModality: formData.get('teachingModality') as string,
    logoUrl: formData.get('logoUrl') as string,
    uniqueCode: generateUniqueCode(),
    studentLimit: 0,
    tutorLimit: 0,
  };

  const requiredFields: (keyof Omit<typeof data, 'directorPhone' | 'logoUrl' | 'uniqueCode' | 'studentLimit' | 'tutorLimit'>)[] = [
    'name', 'address', 'contactEmail', 'region', 'level', 
    'directorName', 'directorEmail', 'teachingModality'
  ];

  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    return { success: false, message: `Todos los campos son obligatorios. Faltan: ${missingFields.join(', ')}` };
  }

  try {
    const docRef = await addDoc(collection(firestore, 'institutions'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    
    // Create notification for admin
    await addDoc(collection(firestore, 'notifications'), {
        type: 'new_institution',
        title: 'Nueva Institución Creada',
        description: `La institución ${data.name} ha sido agregada.`,
        emoji: '🏫',
        createdAt: serverTimestamp(),
        read: false,
    });

    revalidatePath('/admin/institutions');
    return { success: true, name: data.name };
  } catch (error: any) {
    return { success: false, message: 'No se pudo crear la institución. ' + error.message };
  }
}

export async function updateInstitution(institutionId: string, formData: FormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  
  const data = {
    name: formData.get('name') as string,
    address: formData.get('address') as string,
    contactEmail: formData.get('contactEmail') as string,
    region: formData.get('region') as string,
    level: formData.get('level') as string,
    studentLimit: Number(formData.get('studentLimit')),
    tutorLimit: Number(formData.get('tutorLimit')),
    directorName: formData.get('directorName') as string,
    directorEmail: formData.get('directorEmail') as string,
    directorPhone: formData.get('directorPhone') as string,
    teachingModality: formData.get('teachingModality') as string,
    logoUrl: formData.get('logoUrl') as string,
  };

  const requiredFields: (keyof Omit<typeof data, 'directorPhone' | 'logoUrl'>)[] = [
    'name', 'address', 'contactEmail', 'region', 'level', 'studentLimit', 'tutorLimit',
    'directorName', 'directorEmail', 'teachingModality'
  ];

  const missingFields = requiredFields.filter(field => data[field as keyof typeof data] === '' || data[field as keyof typeof data] === null || data[field as keyof typeof data] === undefined);


  if (missingFields.length > 0) {
    return { success: false, message: `Todos los campos son obligatorios. Faltan: ${missingFields.join(', ')}` };
  }

  const institutionRef = doc(firestore, 'institutions', institutionId);

  try {
    await updateDoc(institutionRef, data);
    revalidatePath(`/admin/institutions/${institutionId}`);
    revalidatePath('/admin/institutions');
    return { success: true, name: data.name };
  } catch (error: any) {
    return { success: false, message: 'No se pudo actualizar la institución. ' + error.message };
  }
}

export async function deleteInstitution(institutionId: string) {
  const { firestore } = await getAuthenticatedAppForUser();
  const institutionRef = doc(firestore, 'institutions', institutionId);

  try {
    await deleteDoc(institutionRef);
    revalidatePath('/admin/institutions');
  } catch (error: any) {
    return { success: false, message: 'No se pudo eliminar la institución. ' + error.message };
  }
  redirect('/admin/institutions');
}

export async function updateStudentProfile(prevState: any, formData: FormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  
  const userId = formData.get('userId') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const dni = formData.get('dni') as string;
  const age = formData.get('age') as string;
  const grade = formData.get('grade') as string;
  const city = formData.get('city') as string;
  const phone = formData.get('phone') as string;
  const gender = formData.get('gender') as string;
  const institutionId = formData.get('institutionId') as string;

  if (!userId || !firstName || !lastName || !dni || !age || !grade || !city || !phone || !gender) {
      return { success: false, message: 'Todos los campos son obligatorios, excepto el colegio.' };
  }

  const userProfileRef = doc(firestore, 'users', userId);

  try {
      const dataToUpdate: any = {
          firstName,
          lastName,
          dni,
          age: Number(age),
          grade,
          city,
          phone,
          gender,
          isProfileComplete: true,
      };

      if (institutionId) {
        // Optional: Validate institution code if provided, for now just save it
        dataToUpdate.institutionId = institutionId;
      }
      
      await updateDoc(userProfileRef, dataToUpdate);

      revalidatePath('/student-dashboard');
      return { success: true };
  } catch (error: any) {
      console.error('Error updating student profile:', error);
      return { success: false, message: 'No se pudo actualizar tu perfil. ' + error.message };
  }
}


export async function updateTutorProfile(prevState: any, formData: FormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  
  const userId = formData.get('userId') as string;
  const firstName = formData.get('firstName') as string;
  const lastName = formData.get('lastName') as string;
  const dni = formData.get('dni') as string;
  const phone = formData.get('phone') as string;
  const workArea = formData.get('workArea') as string;
  const gender = formData.get('gender') as string;

  if (!userId || !firstName || !lastName || !dni || !phone || !workArea || !gender) {
      return { success: false, message: 'Todos los campos son obligatorios.' };
  }

  const userProfileRef = doc(firestore, 'users', userId);

  try {
      const dataToUpdate: any = {
          firstName,
          lastName,
          dni,
          phone,
          'tutorDetails.workArea': workArea,
          gender,
          isProfileComplete: true,
      };
      
      await updateDoc(userProfileRef, dataToUpdate);

      revalidatePath('/tutor-dashboard');
      return { success: true };
  } catch (error: any) {
      console.error('Error updating tutor profile:', error);
      return { success: false, message: 'No se pudo actualizar tu perfil de tutor. ' + error.message };
  }
}


export async function createIndependentTutorGroup(formData: FormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  
  const data = {
    name: formData.get('name') as string,
    tutorName: formData.get('tutorName') as string,
    uniqueCode: generateUniqueCode(),
  };

  if (!data.name || !data.tutorName) {
    return { success: false, message: 'El nombre del grupo y del tutor son obligatorios.' };
  }

  try {
    const docRef = await addDoc(collection(firestore, 'independentTutorGroups'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    
    revalidatePath('/admin/independent-tutors');
    return { success: true, name: data.name };
  } catch (error: any) {
    return { success: false, message: 'No se pudo crear el grupo. ' + error.message };
  }
}
