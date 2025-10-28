'use server';

import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedAppForUser, getFirebaseErrorMessage, type State } from './utils';
import { addDoc } from 'firebase/firestore';
import { headers } from 'next/headers';


export async function checkIfUserExists(email: string): Promise<boolean> {
  if (!email) return false;
  const { firestore } = await getAuthenticatedAppForUser();
  const q = query(collection(firestore, 'users'), where('email', '==', email), limit(1));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
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
  const institutionCode = formData.get('institutionCode') as string;
  const profilePictureUrl = formData.get('profilePictureUrl') as string | null;

  if (!userId || !firstName || !lastName || !dni || !age || !grade || !city || !phone || !gender) {
      return { success: false, message: 'Todos los campos son obligatorios, excepto el código.' };
  }

  const userProfileRef = doc(firestore, 'users', userId);
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

  if (profilePictureUrl) {
      dataToUpdate.profilePictureUrl = profilePictureUrl;
  }

  try {
    if (institutionCode) {
        // First, try to find a matching institution
        const institutionsQuery = query(collection(firestore, 'institutions'), where('uniqueCode', '==', institutionCode), limit(1));
        const institutionSnap = await getDocs(institutionsQuery);

        if (!institutionSnap.empty) {
            const institutionDoc = institutionSnap.docs[0];
            const institutionData = institutionDoc.data();
            const institutionId = institutionDoc.id;

            const studentsQuery = query(collection(firestore, 'users'), where('institutionId', '==', institutionId), where('role', '==', 'student'));
            const studentsSnap = await getDocs(studentsQuery);
            const currentStudentCount = studentsSnap.size;

            if (currentStudentCount >= institutionData.studentLimit) {
                return { success: false, message: 'El límite de estudiantes para esta institución ha sido alcanzado. Contacta a tu tutor. 🚫' };
            }
            
            dataToUpdate.institutionId = institutionId;
            dataToUpdate.isHero = true; // Grant Hero features
        } else {
            // If no institution found, check independent tutor groups
            const groupsQuery = query(collection(firestore, 'independentTutorGroups'), where('uniqueCode', '==', institutionCode), limit(1));
            const groupSnap = await getDocs(groupsQuery);
            
            if (!groupSnap.empty) {
                const groupDoc = groupSnap.docs[0];
                const groupData = groupDoc.data();
                const groupId = groupDoc.id;

                const studentsQuery = query(collection(firestore, 'users'), where('institutionId', '==', groupId), where('role', '==', 'student'));
                const studentsSnap = await getDocs(studentsQuery);
                const currentStudentCount = studentsSnap.size;

                if (currentStudentCount >= groupData.studentLimit) {
                    return { success: false, message: 'El límite de estudiantes para este grupo ha sido alcanzado. Contacta a tu tutor. 🚫' };
                }
                
                dataToUpdate.institutionId = groupId; // Set institutionId to the group ID
                dataToUpdate.isHero = true; // Grant Hero features
            } else {
                return { success: false, message: 'El código ingresado no es válido para ninguna institución o grupo de tutor.' };
            }
        }
    }
      
      await updateDoc(userProfileRef, dataToUpdate);

  } catch (error: any) {
      console.error('Error updating student profile:', error);
      return { success: false, message: 'No se pudo actualizar tu perfil. ' + error.message };
  }

  revalidatePath('/student-dashboard');
  return { success: true };
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
  const profilePictureUrl = formData.get('profilePictureUrl') as string | null;

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

      if (profilePictureUrl) {
          dataToUpdate.profilePictureUrl = profilePictureUrl;
      }
      
      await updateDoc(userProfileRef, dataToUpdate);

      return { success: true };
  } catch (error: any) {
      console.error('Error updating tutor profile:', error);
      return { success: false, message: 'No se pudo actualizar tu perfil de tutor. ' + error.message };
  }
}

export async function updateAdminProfile(prevState: any, formData: FormData) {
    const { firestore } = await getAuthenticatedAppForUser();
    
    const userId = formData.get('userId') as string;
    if (!userId) {
        return { success: false, message: 'Usuario no encontrado.' };
    }

    const username = formData.get('username') as string;
    const profilePictureUrl = formData.get('profilePictureUrl') as string | null;

    if (!username) {
        return { success: false, message: 'El nombre de usuario es obligatorio.' };
    }

    const userProfileRef = doc(firestore, 'users', userId);

    try {
        const dataToUpdate: any = {
            username,
        };

        if (profilePictureUrl) {
            dataToUpdate.profilePictureUrl = profilePictureUrl;
        }
        
        await updateDoc(userProfileRef, dataToUpdate);

    } catch (error: any) {
        console.error('Error updating admin profile:', error);
        return { success: false, message: 'No se pudo actualizar tu perfil. ' + error.message };
    }

    // Don't redirect, return success message
    return { success: true, message: '¡Perfil Actualizado! ✅' };
}

export async function createStudent(prevState: State, formData: FormData): Promise<State> {
  const { auth, firestore } = await getAuthenticatedAppForUser();
  const email = formData.get('email') as string;
  const username = formData.get('username') as string;

  if (!email || !username) {
    return { message: 'El nombre y el email son obligatorios.' };
  }
  
  const password = 'PREDU' + Math.floor(1000 + Math.random() * 9000);

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
      isProfileComplete: false,
      role: 'student', // Default role
    };
    
    await setDoc(userProfileRef, userProfileData);

    await addDoc(collection(firestore, 'notifications'), {
        type: 'new_user_admin',
        title: 'Usuario Creado por Admin',
        description: `El usuario ${username} (${email}) fue creado.`,
        emoji: '👤',
        createdAt: serverTimestamp(),
        read: false,
    });

    revalidatePath('/admin');
    return { success: true, username: username, generatedPassword: password };

  } catch (e: any) {
    return { message: getFirebaseErrorMessage(e.code) };
  }
}

export async function upgradeToHero(userId: string) {
  if (!userId) {
    return { success: false, message: "User not found." };
  }
  const { firestore } = await getAuthenticatedAppForUser();
  const userProfileRef = doc(firestore, 'users', userId);

  try {
    await updateDoc(userProfileRef, {
      isHero: true,
    });
    revalidatePath('/student-dashboard');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: 'Could not upgrade to Hero. ' + error.message };
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

export async function updateStudentSection(studentId: string, section: string) {
    const { firestore } = await getAuthenticatedAppForUser();
    const userProfileRef = doc(firestore, 'users', studentId);

    try {
        await updateDoc(userProfileRef, { section });
        revalidatePath('/tutor-dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating student section:', error);
        return { success: false, message: 'No se pudo actualizar la sección del estudiante.' };
    }
}
