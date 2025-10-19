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
  limit,
  orderBy,
} from 'firebase/firestore';
import { redirect } from 'next/navigation';
import { initializeServerApp } from '@/firebase/server-init';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

type State = {
  message?: string | null;
  success?: boolean;
  username?: string | null;
  dni?: string | null;
  generatedPassword?: string | null;
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
    const tutorsQuery = query(collection(firestore, 'users'), where('institutionId', '==', institutionId), where('role', '==', 'tutor'));
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
  
  const data: { [key: string]: any } = {
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
  };

  // Only add logoUrl if it's present in the form data
  const logoUrl = formData.get('logoUrl') as string | null;
    if (logoUrl) {
        data.logoUrl = logoUrl;
    }

  const requiredFields = [
    'name', 'address', 'contactEmail', 'region', 'level', 'studentLimit', 'tutorLimit',
    'directorName', 'directorEmail', 'teachingModality'
  ];

  const missingFields = requiredFields.filter(field => data[field] === '' || data[field] === null || data[field] === undefined);

  if (missingFields.length > 0) {
    return { success: false, message: `Todos los campos son obligatorios. Faltan: ${missingFields.join(', ')}` };
  }

  const institutionRef = doc(firestore, 'institutions', institutionId);

  try {
    await updateDoc(institutionRef, data);
    revalidatePath(`/admin/institutions/${institutionId}`);
    revalidatePath('/admin/institutions');
    return { success: true, name: data.name as string };
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
      studentLimit: 5, // Default limit
      tutorLimit: 1,  // Default limit
      createdAt: serverTimestamp(),
    });
    
    revalidatePath('/admin/independent-tutors');
    return { success: true, name: data.name };
  } catch (error: any) {
    return { success: false, message: 'No se pudo crear el grupo. ' + error.message };
  }
}

export async function updateIndependentTutorGroup(groupId: string, formData: FormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  
  const data: { [key: string]: any } = {
    studentLimit: Number(formData.get('studentLimit')),
    tutorLimit: Number(formData.get('tutorLimit')),
  };
  
  const groupRef = doc(firestore, 'independentTutorGroups', groupId);
  const groupSnap = await getDoc(groupRef);
  const groupName = groupSnap.data()?.name || 'el grupo';

  try {
    await updateDoc(groupRef, data);
    revalidatePath(`/admin/independent-tutors/${groupId}`);
    return { success: true, name: groupName };
  } catch (error: any) {
    return { success: false, message: 'No se pudo actualizar el grupo. ' + error.message };
  }
}


export async function deleteIndependentTutorGroup(groupId: string) {
  const { firestore } = await getAuthenticatedAppForUser();
  const groupRef = doc(firestore, 'independentTutorGroups', groupId);

  try {
    await deleteDoc(groupRef);
    revalidatePath('/admin/independent-tutors');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: 'No se pudo eliminar el grupo. ' + error.message };
  }
}

export async function registerHeroTutor(prevState: State, formData: FormData): Promise<State> {
    const { firestore } = await getAuthenticatedAppForUser();

    const userId = formData.get('userId') as string;
    if (!userId) {
        return { success: false, message: 'Debes estar autenticado para enviar una solicitud.' };
    }
    const dni = formData.get('dni') as string;
    const email = formData.get('email') as string;
    const username = formData.get('username') as string;

    const requestData = {
        userId: userId,
        username: username,
        email: email,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        dni: dni,
        gender: formData.get('gender') as string,
        phone: formData.get('phone') as string,
        groupName: formData.get('groupName') as string,
        region: formData.get('region') as string,
        reasonForUse: formData.get('reasonForUse') as string,
        createdAt: serverTimestamp(),
    };
    
    // Create a version of requiredFields without the userId, email, and username
    const { userId: _, email: __, username: ___, ...requiredFields } = requestData;

    for (const [key, value] of Object.entries(requiredFields)) {
        if (!value) {
            return { success: false, message: `El campo ${key} es obligatorio.` };
        }
    }

    try {
        // --- Check for existing PENDING or APPROVED requests ---
        const qActiveDni = query(collection(firestore, "tutorRequests"), where("dni", "==", dni), where("status", "in", ["pending", "approved"]));
        const qActiveEmail = query(collection(firestore, "tutorRequests"), where("email", "==", email), where("status", "in", ["pending", "approved"]));
        
        const [activeDniSnapshot, activeEmailSnapshot] = await Promise.all([getDocs(qActiveDni), getDocs(qActiveEmail)]);

        if (!activeDniSnapshot.empty) {
            return { success: false, message: 'Ya existe una solicitud pendiente o aprobada con este DNI.' };
        }
        if (!activeEmailSnapshot.empty) {
            return { success: false, message: 'Ya existe una solicitud pendiente o aprobada con este correo electrónico.' };
        }
        
        // --- Check for an existing REJECTED request to UPDATE ---
        const qRejected = query(collection(firestore, "tutorRequests"), where("userId", "==", userId), where("status", "==", "rejected"));
        const rejectedSnapshot = await getDocs(qRejected);
        
        if (!rejectedSnapshot.empty) {
            // Found a rejected request, let's update it
            const existingRequestRef = rejectedSnapshot.docs[0].ref;
            await updateDoc(existingRequestRef, {
                ...requestData, // Update with all new data
                status: 'pending', // Reset status
                notifiedRejected: false, // Reset notification flag
            });
        } else {
            // No existing request found, create a new one
            await addDoc(collection(firestore, 'tutorRequests'), {
                ...requestData,
                status: 'pending',
                notifiedRejected: false,
            });
        }

        // --- Finalize ---
        const userProfileRef = doc(firestore, 'users', userId);
        await updateDoc(userProfileRef, { dni: requestData.dni });

        await addDoc(collection(firestore, 'notifications'), {
            type: 'new_tutor_request',
            title: 'Nueva Solicitud de Tutor',
            description: `El usuario ${requestData.username} (${requestData.email}) ha solicitado ser Tutor Héroe.`,
            emoji: '🦸',
            createdAt: serverTimestamp(),
            read: false,
        });
        
        revalidatePath('/admin/requests');

        return { success: true, message: 'Tu solicitud ha sido enviada y está pendiente de aprobación.', dni: dni };

    } catch (e: any) {
        console.error("Error creating tutor request:", e);
        return { success: false, message: 'Ocurrió un error inesperado al enviar tu solicitud.' };
    }
}

export async function approveTutorRequest(requestId: string) {
    const { firestore } = await getAuthenticatedAppForUser();
    const requestRef = doc(firestore, 'tutorRequests', requestId);

    try {
        const requestSnap = await getDoc(requestRef);
        if (!requestSnap.exists()) {
            throw new Error("Solicitud no encontrada.");
        }

        const requestData = requestSnap.data();

        // 1. Get the existing user by UID from the request
        const userToUpdateRef = doc(firestore, 'users', requestData.userId);

        // 2. Update their profile with tutor information
        await updateDoc(userToUpdateRef, {
            firstName: requestData.firstName,
            lastName: requestData.lastName,
            dni: requestData.dni,
            gender: requestData.gender,
            phone: requestData.phone,
            role: 'tutor',
            isProfileComplete: true, // Mark as complete since they filled the form
            tutorVerified: false, // NEW: Add verification flag
        });

        // 3. Create IndependentTutorGroup document in Firestore
        const groupData = {
            name: requestData.groupName,
            tutorName: `${requestData.firstName} ${requestData.lastName}`,
            tutorId: requestData.userId,
            region: requestData.region,
            reasonForUse: requestData.reasonForUse,
            uniqueCode: generateUniqueCode(),
            studentLimit: 5, // Default limit
            tutorLimit: 1,   // Default limit
            createdAt: serverTimestamp(),
        };
        await addDoc(collection(firestore, 'independentTutorGroups'), groupData);

        // 4. Update the request status
        await updateDoc(requestRef, { status: 'approved' });

        revalidatePath('/admin/requests');
        return { success: true };
    } catch (error: any) {
        console.error("Error approving tutor request:", error);
        return { success: false, message: getFirebaseErrorMessage(error.code) || error.message };
    }
}

export async function rejectTutorRequest(requestId: string) {
    const { firestore } = await getAuthenticatedAppForUser();
    const requestRef = doc(firestore, 'tutorRequests', requestId);

    try {
        await updateDoc(requestRef, { status: 'rejected' });
        revalidatePath('/admin/requests');
        return { success: true };
    } catch (error: any) {
        console.error("Error rejecting tutor request:", error);
        return { success: false, message: error.message };
    }
}


export async function verifyTutorAndLogin(prevState: any, formData: FormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  
  const dni = formData.get('dni') as string;
  const uniqueCode = formData.get('uniqueCode') as string;
  const userId = formData.get('userId') as string;

  if (!dni || !uniqueCode || !userId) {
    return { success: false, message: 'DNI, código y ID de usuario son obligatorios.' };
  }

  try {
    // 1. Find the user profile and check if the DNI matches first
    const userProfileRef = doc(firestore, 'users', userId);
    const userProfileSnap = await getDoc(userProfileRef);

    if (!userProfileSnap.exists() || userProfileSnap.data().dni !== dni) {
      return { success: false, message: 'El DNI no coincide con nuestros registros.' };
    }
    
    // 2. Find the group by the unique code and tutorId
    const groupQuery = query(collection(firestore, 'independentTutorGroups'), where('uniqueCode', '==', uniqueCode), where('tutorId', '==', userId), limit(1));
    const groupSnapshot = await getDocs(groupQuery);

    if (groupSnapshot.empty) {
      return { success: false, message: 'El código del grupo no es válido o no corresponde a tu usuario.' };
    }

    // 3. If both are valid, update the user profile
    await updateDoc(userProfileRef, {
      tutorVerified: true,
      lastLogin: serverTimestamp(),
    });

  } catch (error: any) {
    console.error('Error verifying tutor:', error);
    return { success: false, message: 'Ocurrió un error inesperado durante la verificación.' };
  }
  
  // 4. Redirect to tutor dashboard upon success
  redirect('/tutor-dashboard');
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

export async function sendMessage(chatId: string, messageData: { text: string, senderId: string, receiverId: string }) {
    const { firestore } = await getAuthenticatedAppForUser();
    
    const messagesColRef = collection(firestore, 'chats', chatId, 'messages');
    const chatDocRef = doc(firestore, 'chats', chatId);

    try {
        await addDoc(messagesColRef, {
            ...messageData,
            timestamp: serverTimestamp(),
            isRead: false,
        });

        // Update the last message on the parent chat document
        await setDoc(chatDocRef, {
            participants: [messageData.senderId, messageData.receiverId],
            lastMessage: {
                text: messageData.text,
                senderId: messageData.senderId,
                timestamp: serverTimestamp(),
                isRead: false,
            }
        }, { merge: true });


        return { success: true };
    } catch (error: any) {
        console.error("Error sending message:", error);
        return { success: false, message: "Could not send message. " + error.message };
    }
}

export async function markChatAsRead(chatId: string) {
    const { firestore } = await getAuthenticatedAppForUser();
    const chatDocRef = doc(firestore, 'chats', chatId);

    try {
        await updateDoc(chatDocRef, {
            'lastMessage.isRead': true
        });
        return { success: true };
    } catch (error: any) {
        // Don't show toast for this as it's a background action
        console.error("Error marking chat as read:", error);
        return { success: false, message: "Could not mark chat as read." };
    }
}

export async function createForumPost(prevState: any, formData: FormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  const content = formData.get('content') as string;
  const authorId = formData.get('authorId') as string;
  const authorName = formData.get('authorName') as string;
  const authorRole = formData.get('authorRole') as string;
  const authorProfilePictureUrl = formData.get('authorProfilePictureUrl') as string;
  const associationId = formData.get('associationId') as string;

  if (!content || !authorId || !authorName || !associationId) {
    return { success: false, message: 'Faltan datos para crear la publicación.' };
  }

  try {
    await addDoc(collection(firestore, 'forums'), {
      content,
      authorId,
      authorName,
      authorRole,
      authorProfilePictureUrl,
      associationId, // Link post to the institution/group
      createdAt: serverTimestamp(),
      commentCount: 0,
    });

    revalidatePath('/student-dashboard');
    revalidatePath('/tutor-dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Error creating forum post:', error);
    return { success: false, message: 'No se pudo crear la publicación. ' + error.message };
  }
}
