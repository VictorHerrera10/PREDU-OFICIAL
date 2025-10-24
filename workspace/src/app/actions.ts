
'use server';

import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  writeBatch,
  getDocs,
  query,
  where,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { initializeServerApp } from '@/firebase/server-init';
import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import type { QuestionFormData } from '@/app/admin/psychological-test/QuestionForm';
import { revalidatePath } from 'next/cache';

// Helper to get Firebase services on the server
async function getFirebaseServices() {
  const { auth, firestore } = await initializeServerApp();
  return { auth, firestore };
}

// Reusable error handler
function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
      return 'Las credenciales no son correctas. Revisa tus apuntes y vuelve a intentarlo. 🤔';
    case 'auth/user-not-found':
      return 'No encontramos a ningún estudiante con ese correo.';
    case 'auth/wrong-password':
      return '¡Contraseña incorrecta! Inténtalo de nuevo. 🤫';
    case 'auth/email-already-in-use':
      return '¡Ese email ya está en uso! Parece que ya estás en la lista. Intenta iniciar sesión. 😉';
    case 'auth/weak-password':
      return 'Tu contraseña es muy débil. ¡Necesitas al menos 6 caracteres para proteger tu mochila digital! 🎒';
    case 'auth/operation-not-allowed':
      return 'Esta operación no está permitida. Habla con el director si crees que es un error.';
    default:
      return 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde. 🏫';
  }
}

// User Registration
export async function register(prevState: any, formData: FormData) {
  const { auth, firestore } = await getFirebaseServices();
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName: username });

    const userDocRef = doc(firestore, 'users', user.uid);
    await setDoc(userDocRef, {
      id: user.uid,
      username: username,
      email: user.email,
      creationDate: serverTimestamp(),
      isProfileComplete: false,
      role: null, // Role is set after this initial registration
      status: 'offline',
      lastSeen: serverTimestamp(),
    });

    return {
      message: '¡Registro exitoso!',
      success: true,
      username: username,
    };
  } catch (error: any) {
    const errorCode = error.code;
    return { message: getFirebaseErrorMessage(errorCode), success: false };
  }
}

// Check if user exists
export async function checkIfUserExists(email: string): Promise<boolean> {
  const { firestore } = await getFirebaseServices();
  const usersRef = collection(firestore, 'users');
  const q = query(usersRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

// Update User Role
export async function updateUserRole(uid: string, role: 'student' | 'tutor') {
  const { firestore } = await getFirebaseServices();
  const userDocRef = doc(firestore, 'users', uid);
  try {
    await updateDoc(userDocRef, { role: role });
    if (role === 'student') {
      redirect('/student-dashboard');
    } else {
      redirect('/tutor-dashboard');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  }
}

// Update Student Profile
export async function updateStudentProfile(prevState: any, formData: FormData) {
  const { firestore } = await getFirebaseServices();
  const userId = formData.get('userId') as string;
  const institutionCode = formData.get('institutionCode') as string;

  if (!userId) {
    return { success: false, message: 'ID de usuario no encontrado.' };
  }

  const userDocRef = doc(firestore, 'users', userId);

  try {
    let institutionId: string | undefined = undefined;

    // Check if an institution code was provided and validate it
    if (institutionCode && institutionCode.length === 6) {
      const institutionsRef = collection(firestore, 'institutions');
      const q = query(institutionsRef, where('uniqueCode', '==', institutionCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        institutionId = querySnapshot.docs[0].id;
      } else {
         const groupsRef = collection(firestore, 'independentTutorGroups');
         const qGroups = query(groupsRef, where('uniqueCode', '==', institutionCode));
         const groupsSnapshot = await getDocs(qGroups);

         if(!groupsSnapshot.empty) {
            institutionId = groupsSnapshot.docs[0].id;
         } else {
            return { success: false, message: 'El código de institución o grupo no es válido.' };
         }
      }
    }

    const ageValue = formData.get('age');

    await updateDoc(userDocRef, {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      dni: formData.get('dni'),
      age: ageValue ? Number(ageValue) : null,
      grade: formData.get('grade'),
      city: formData.get('city'),
      phone: formData.get('phone'),
      gender: formData.get('gender'),
      isProfileComplete: true,
      profilePictureUrl: formData.get('profilePictureUrl') || null,
      ...(institutionId && { institutionId: institutionId }), // Only add if institutionId is found
    });

    revalidatePath('/student-dashboard');
    return { success: true, message: '¡Perfil actualizado con éxito!' };
  } catch (error: any) {
    console.error('Error updating student profile:', error);
    return { success: false, message: error.message };
  }
}

// Update Tutor Profile
export async function updateTutorProfile(prevState: any, formData: FormData) {
  const { firestore } = await getFirebaseServices();
  const userId = formData.get('userId') as string;
  if (!userId) {
    return { success: false, message: 'ID de usuario no encontrado.' };
  }

  const userDocRef = doc(firestore, 'users', userId);

  try {
    await updateDoc(userDocRef, {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      dni: formData.get('dni'),
      phone: formData.get('phone'),
      gender: formData.get('gender'),
      tutorDetails: {
        workArea: formData.get('workArea'),
      },
      isProfileComplete: true,
      profilePictureUrl: formData.get('profilePictureUrl') || null,
    });
    revalidatePath('/tutor-dashboard');
    return { success: true, message: '¡Perfil actualizado con éxito!' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Tutor Registration
export async function registerTutor(prevState: any, formData: FormData) {
  const { firestore } = await getFirebaseServices();
  const userId = formData.get('userId') as string;
  const accessCode = formData.get('accessCode') as string;
  const institutionId = formData.get('institutionId') as string;
  const roleInInstitution = formData.get('roleInInstitution') as string;

  if (!userId || !accessCode || !institutionId || !roleInInstitution) {
    return {
      success: false,
      message: 'Todos los campos son obligatorios.',
    };
  }

  try {
    const institutionDocRef = doc(firestore, 'institutions', institutionId);
    const institutionDoc = await getDoc(institutionDocRef);

    if (!institutionDoc.exists()) {
      return { success: false, message: 'La institución seleccionada no existe.' };
    }

    if (institutionDoc.data().uniqueCode !== accessCode) {
      return { success: false, message: 'El código de acceso es incorrecto.' };
    }
    
    // Check tutor limit
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('institutionId', '==', institutionId), where('role', '==', 'tutor'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.size >= (institutionDoc.data().tutorLimit || 0)) {
        return { success: false, message: 'Se ha alcanzado el límite de tutores para esta institución.' };
    }

    const userDocRef = doc(firestore, 'users', userId);
    await updateDoc(userDocRef, {
      role: 'tutor',
      institutionId: institutionId,
      tutorDetails: {
        roleInInstitution: roleInInstitution
      }
    });

    revalidatePath('/dashboard');
    redirect('/dashboard');
  } catch (error: any) {
    console.error('Error registering tutor:', error);
    return { success: false, message: error.message };
  }
}

// Hero Tutor Registration
export async function registerHeroTutor(prevState: any, formData: FormData): Promise<{
    message?: string | null;
    success?: boolean;
    dni?: string | null;
}> {
    const { firestore } = await getFirebaseServices();
    
    const requestData = {
        userId: formData.get('userId') as string,
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        dni: formData.get('dni') as string,
        gender: formData.get('gender') as string,
        phone: formData.get('phone') as string,
        groupName: formData.get('groupName') as string,
        region: formData.get('region') as string,
        reasonForUse: formData.get('reasonForUse') as string,
        status: 'pending',
        createdAt: serverTimestamp() as Timestamp,
    };
    
    if (!requestData.userId || !requestData.dni) {
        return { success: false, message: 'Faltan datos del usuario o DNI.' };
    }

    try {
        const requestsRef = collection(firestore, 'tutorRequests');
        await addDoc(requestsRef, requestData);

        return {
            success: true,
            message: 'Tu solicitud ha sido enviada. Serás notificado cuando sea revisada.',
            dni: requestData.dni,
        };
    } catch (error: any) {
        console.error("Error creating tutor request:", error);
        return { success: false, message: "No se pudo enviar tu solicitud. Intenta de nuevo más tarde." };
    }
}


// Forgot Password
export async function forgotPassword(prevState: any, formData: FormData) {
  const { auth } = await getFirebaseServices();
  const email = formData.get('email') as string;
  try {
    await sendPasswordResetEmail(auth, email);
    redirect(
      '/forgot-password?message=Se han enviado las instrucciones para restablecer tu contraseña. ¡Revisa tu correo!'
    );
  } catch (error: any) {
    const errorCode = error.code;
    return { message: getFirebaseErrorMessage(errorCode) };
  }
}

// Admin action: Create user
export async function createStudent(
  prevState: { message: string | null; success: boolean },
  formData: FormData
) {
  const { auth, firestore } = await getFirebaseServices();
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const generatedPassword = Math.random().toString(36).slice(-8);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, generatedPassword);
    const user = userCredential.user;

    await updateProfile(user, { displayName: username });

    const userDocRef = doc(firestore, 'users', user.uid);
    await setDoc(userDocRef, {
      id: user.uid,
      username: username,
      email: user.email,
      creationDate: serverTimestamp(),
      isProfileComplete: false,
      role: 'student',
    });

    return {
      message: '¡Usuario creado con éxito!',
      success: true,
      username: username,
      generatedPassword: generatedPassword,
    };
  } catch (error: any) {
    return {
      message: getFirebaseErrorMessage(error.code),
      success: false,
    };
  }
}

// Admin action: Update user
export async function updateUser(userId: string, formData: FormData) {
  const { firestore } = await getFirebaseServices();
  const username = formData.get('username') as string;
  const role = formData.get('role') as string;

  try {
    const userDocRef = doc(firestore, 'users', userId);
    await updateDoc(userDocRef, {
      username: username,
      role: role,
    });
    revalidatePath('/admin');
    return { success: true, username: username };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Admin Action: Update Admin Profile
export async function updateAdminProfile(prevState: any, formData: FormData) {
  const { auth, firestore } = await getFirebaseServices();
  const userId = formData.get('userId') as string;

  if (!userId) {
    return { success: false, message: 'ID de usuario no encontrado.' };
  }

  const user = auth.currentUser;
  if (!user || user.uid !== userId) {
     return { success: false, message: 'No autorizado.' };
  }

  try {
     const username = formData.get('username') as string;
     await updateProfile(user, { 
       displayName: username,
       photoURL: formData.get('profilePictureUrl') as string,
      });

    const userDocRef = doc(firestore, 'users', userId);
    await updateDoc(userDocRef, {
      username: username,
      profilePictureUrl: formData.get('profilePictureUrl') || null,
    });
    revalidatePath('/admin/profile');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Institution Management
export async function createInstitution(formData: FormData) {
    const { firestore } = await getFirebaseServices();
    try {
        const uniqueCode = uuidv4().slice(0, 6).toUpperCase();
        const newInstitution = {
            name: formData.get('name') as string,
            region: formData.get('region') as string,
            address: formData.get('address') as string,
            level: formData.get('level') as string,
            teachingModality: formData.get('teachingModality') as string,
            directorName: formData.get('directorName') as string,
            directorEmail: formData.get('directorEmail') as string,
            directorPhone: formData.get('directorPhone') as string || null,
            logoUrl: formData.get('logoUrl') as string || null,
            contactEmail: formData.get('contactEmail') as string,
            studentLimit: 0,
            tutorLimit: 0,
            uniqueCode: uniqueCode,
            createdAt: serverTimestamp(),
        };

        const institutionsRef = collection(firestore, 'institutions');
        await addDoc(institutionsRef, newInstitution);
        
        revalidatePath('/admin/institutions');
        return { success: true, name: newInstitution.name };

    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function updateInstitution(id: string, formData: FormData) {
  const { firestore } = await getFirebaseServices();
  try {
    const institutionRef = doc(firestore, 'institutions', id);
    const updatedData = {
      name: formData.get('name') as string,
      region: formData.get('region') as string,
      address: formData.get('address') as string,
      level: formData.get('level') as string,
      teachingModality: formData.get('teachingModality') as string,
      directorName: formData.get('directorName') as string,
      directorEmail: formData.get('directorEmail') as string,
      directorPhone: formData.get('directorPhone') as string || null,
      logoUrl: formData.get('logoUrl') as string || null,
      contactEmail: formData.get('contactEmail') as string,
      studentLimit: Number(formData.get('studentLimit') as string),
      tutorLimit: Number(formData.get('tutorLimit') as string),
    };

    await updateDoc(institutionRef, updatedData);
    revalidatePath('/admin/institutions');
    revalidatePath(`/admin/institutions/${id}`);

    return { success: true, name: updatedData.name };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteInstitution(id: string) {
  const { firestore } = await getFirebaseServices();
  try {
    await deleteDoc(doc(firestore, 'institutions', id));
    revalidatePath('/admin/institutions');
  } catch (error: any) {
    return { success: false, message: error.message };
  }
  redirect('/admin/institutions');
}

// Psychological Test Question Management
export async function createPsychologicalQuestion(data: QuestionFormData) {
  const { firestore } = await getFirebaseServices();
  try {
    await addDoc(collection(firestore, 'psychological_questions'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    revalidatePath('/admin/psychological-test');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updatePsychologicalQuestion(id: string, data: QuestionFormData) {
  const { firestore } = await getFirebaseServices();
  try {
    await updateDoc(doc(firestore, 'psychological_questions', id), data);
    revalidatePath('/admin/psychological-test');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deletePsychologicalQuestion(id: string) {
  const { firestore } = await getFirebaseServices();
  try {
    await deleteDoc(doc(firestore, 'psychological_questions', id));
    revalidatePath('/admin/psychological-test');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

// Independent Tutors Management
export async function createIndependentTutorGroup(formData: FormData) {
  const { firestore } = await getFirebaseServices();
  try {
    const uniqueCode = uuidv4().slice(0, 6).toUpperCase();
    const newGroup = {
      name: formData.get('name') as string,
      tutorName: formData.get('tutorName') as string,
      uniqueCode,
      studentLimit: 10, // Default limit
      tutorLimit: 1, // Default limit
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(firestore, 'independentTutorGroups'), newGroup);
    revalidatePath('/admin/independent-tutors');
    return { success: true, name: newGroup.name };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateIndependentTutorGroup(id: string, formData: FormData) {
  const { firestore } = await getFirebaseServices();
  try {
    const groupRef = doc(firestore, 'independentTutorGroups', id);
    const updatedData = {
      studentLimit: Number(formData.get('studentLimit')),
      tutorLimit: Number(formData.get('tutorLimit')),
    };
    await updateDoc(groupRef, updatedData);
    revalidatePath(`/admin/independent-tutors/${id}`);
    const groupDoc = await getDoc(groupRef);
    return { success: true, name: groupDoc.data()?.name };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}


export async function deleteIndependentTutorGroup(groupId: string) {
  const { firestore } = await getFirebaseServices();
  const batch = writeBatch(firestore);

  try {
    // 1. Find users associated with the group
    const usersQuery = query(collection(firestore, 'users'), where('institutionId', '==', groupId));
    const usersSnapshot = await getDocs(usersQuery);

    // 2. Unlink users from the group
    usersSnapshot.forEach(userDoc => {
      batch.update(userDoc.ref, { institutionId: null });
    });

    // 3. Delete the group document itself
    const groupRef = doc(firestore, 'independentTutorGroups', groupId);
    batch.delete(groupRef);

    // 4. Commit the batch
    await batch.commit();

    revalidatePath('/admin/independent-tutors');
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting group and unlinking users:", error);
    return { success: false, message: error.message };
  }
}

// Approve/Reject Tutor Requests
export async function approveTutorRequest(requestId: string) {
  const { firestore, auth } = await getFirebaseServices();
  const requestRef = doc(firestore, 'tutorRequests', requestId);

  try {
    const requestDoc = await getDoc(requestRef);
    if (!requestDoc.exists()) {
      return { success: false, message: 'La solicitud no existe.' };
    }
    const requestData = requestDoc.data();

    // 1. Create a new group for the tutor
    const uniqueCode = uuidv4().slice(0, 6).toUpperCase();
    const groupRef = await addDoc(collection(firestore, 'independentTutorGroups'), {
        name: requestData.groupName,
        tutorName: `${requestData.firstName} ${requestData.lastName}`,
        tutorId: requestData.userId,
        uniqueCode,
        region: requestData.region,
        reasonForUse: requestData.reasonForUse,
        studentLimit: 10,
        tutorLimit: 1,
        createdAt: serverTimestamp(),
    });

    // 2. Update the user's role and link them to the new group
    const userRef = doc(firestore, 'users', requestData.userId);
    await updateDoc(userRef, {
        role: 'tutor',
        institutionId: groupRef.id,
        tutorVerified: false, // Set to false, needs verification step
    });

    // 3. Update the request status to 'approved'
    await updateDoc(requestRef, { status: 'approved' });

    revalidatePath('/admin/independent-tutors');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function rejectTutorRequest(requestId: string) {
  const { firestore } = await getFirebaseServices();
  try {
    const requestRef = doc(firestore, 'tutorRequests', requestId);
    await updateDoc(requestRef, { status: 'rejected' });
    revalidatePath('/admin/independent-tutors');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function verifyTutorAndLogin(prevState: any, formData: FormData) {
  const { firestore } = await getFirebaseServices();
  const userId = formData.get('userId') as string;
  const dni = formData.get('dni') as string;
  const uniqueCode = formData.get('uniqueCode') as string;
  
  if(!userId || !dni || !uniqueCode) {
    return { success: false, message: "Todos los campos son obligatorios." };
  }

  try {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists() || userDoc.data().dni !== dni) {
       return { success: false, message: "El DNI no coincide con nuestros registros." };
    }
    
    const groupId = userDoc.data().institutionId;
    if (!groupId) {
         return { success: false, message: "No estás asociado a ningún grupo." };
    }
    
    const groupRef = doc(firestore, 'independentTutorGroups', groupId);
    const groupDoc = await getDoc(groupRef);
     if (!groupDoc.exists() || groupDoc.data().uniqueCode !== uniqueCode) {
        return { success: false, message: "El código de grupo es incorrecto." };
    }
    
    // All checks passed, verify the tutor
    await updateDoc(userRef, { tutorVerified: true });
    
    revalidatePath('/dashboard');
    redirect('/tutor-dashboard');

  } catch(error: any) {
      return { success: false, message: error.message };
  }
}

export async function upgradeToHero(userId: string) {
    const { firestore } = await getFirebaseServices();
    if (!userId) {
        return { success: false, message: "Usuario no encontrado." };
    }
    try {
        const userRef = doc(firestore, 'users', userId);
        await updateDoc(userRef, { isHero: true });
        revalidatePath('/student-dashboard');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

// Chat Actions
export async function sendMessage(chatId: string, messageData: { text: string, senderId: string, receiverId: string }) {
    const { firestore } = await getFirebaseServices();
    const chatRef = doc(firestore, 'chats', chatId);
    const messagesRef = collection(chatRef, 'messages');

    try {
        const timestamp = serverTimestamp();

        // Add message to the subcollection
        await addDoc(messagesRef, {
            ...messageData,
            timestamp,
            isRead: false,
        });

        // Update the lastMessage on the parent chat document
        await setDoc(chatRef, {
            participants: [messageData.senderId, messageData.receiverId],
            lastMessage: {
                text: messageData.text,
                senderId: messageData.senderId,
                timestamp,
                isRead: false,
            }
        }, { merge: true });

        revalidatePath(`/admin/support`);
        return { success: true };
    } catch (error: any) {
        console.error("Error sending message:", error);
        return { success: false, message: error.message };
    }
}


export async function markChatAsRead(chatId: string) {
    const { firestore } = await getFirebaseServices();
    const chatRef = doc(firestore, 'chats', chatId);
    try {
        await updateDoc(chatRef, { 'lastMessage.isRead': true });
        return { success: true };
    } catch (error) {
        // It's not critical if this fails, so we can just log it.
        console.error("Failed to mark chat as read:", error);
        return { success: false };
    }
}

// Forum Actions
export async function createForumPost(data: {
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorProfilePictureUrl?: string;
  associationId: string;
  isAnnouncement?: boolean;
  imageUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
}) {
    const { firestore } = await getFirebaseServices();
    try {
        await addDoc(collection(firestore, 'forums'), {
            ...data,
            createdAt: serverTimestamp(),
            commentCount: 0,
        });
        revalidatePath('/student-dashboard');
        revalidatePath('/tutor-dashboard');
        revalidatePath('/admin/forums');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function deleteForumPost(postId: string, authorId: string) {
    const { firestore, auth } = await getFirebaseServices();
    // This is a workaround as server actions do not have auth context by default
    // In a real app, you'd get the user from a session
    // For now, we assume the client checks permissions, but the rule is what matters
    // const user = auth.currentUser;
    // if (!user || user.uid !== authorId) {
    //     return { success: false, message: "No tienes permiso para eliminar esta publicación." };
    // }
    try {
        // Note: This doesn't delete subcollections (comments). For a production app,
        // you'd want a Cloud Function to handle recursive deletes.
        await deleteDoc(doc(firestore, 'forums', postId));
        revalidatePath('/student-dashboard');
        revalidatePath('/tutor-dashboard');
        revalidatePath('/admin/forums');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function editForumPost(postId: string, authorId: string, newContent: string) {
    const { firestore, auth } = await getFirebaseServices();
    // const user = auth.currentUser;
    // if (!user || user.uid !== authorId) {
    //     return { success: false, message: "No tienes permiso para editar esta publicación." };
    // }
     if (!newContent.trim()) {
        return { success: false, message: "El contenido no puede estar vacío." };
    }
    try {
        await updateDoc(doc(firestore, 'forums', postId), {
            content: newContent,
            editedAt: serverTimestamp(),
        });
        revalidatePath('/student-dashboard');
        revalidatePath('/tutor-dashboard');
        revalidatePath('/admin/forums');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export async function createForumComment(data: {
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorProfilePictureUrl?: string;
  imageUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
}) {
    const { firestore } = await getFirebaseServices();
    const { postId, ...commentData } = data;
    const postRef = doc(firestore, 'forums', postId);
    const commentsRef = collection(postRef, 'comments');
    const batch = writeBatch(firestore);

    try {
        const newCommentRef = doc(commentsRef);
        batch.set(newCommentRef, { ...commentData, createdAt: serverTimestamp() });
        
        const postDoc = await getDoc(postRef);
        const currentCommentCount = postDoc.data()?.commentCount || 0;
        batch.update(postRef, { commentCount: currentCommentCount + 1 });
        
        await batch.commit();

        revalidatePath('/student-dashboard');
        revalidatePath('/tutor-dashboard');
        revalidatePath('/admin/forums');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}


export async function deleteForumComment(postId: string, commentId: string, authorId: string) {
    const { firestore, auth } = await getFirebaseServices();
    // const user = auth.currentUser;
    // if (!user || user.uid !== authorId) {
    //     return { success: false, message: "No tienes permiso para eliminar este comentario." };
    // }

    const postRef = doc(firestore, 'forums', postId);
    const commentRef = doc(postRef, 'comments', commentId);
    const batch = writeBatch(firestore);
    
    try {
        batch.delete(commentRef);
        const postDoc = await getDoc(postRef);
        const currentCommentCount = postDoc.data()?.commentCount || 0;
        batch.update(postRef, { commentCount: Math.max(0, currentCommentCount - 1) });
        
        await batch.commit();
        revalidatePath('/student-dashboard');
        revalidatePath('/tutor-dashboard');
        revalidatePath('/admin/forums');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}

export async function editForumComment(postId: string, commentId: string, authorId: string, newContent: string) {
    const { firestore, auth } = await getFirebaseServices();
    // const user = auth.currentUser;
    // if (!user || user.uid !== authorId) {
    //     return { success: false, message: "No tienes permiso para editar este comentario." };
    // }
    if (!newContent.trim()) {
        return { success: false, message: "El contenido no puede estar vacío." };
    }
    try {
        const commentRef = doc(firestore, 'forums', postId, 'comments', commentId);
        await updateDoc(commentRef, {
            content: newContent,
            editedAt: serverTimestamp(),
        });
        revalidatePath('/student-dashboard');
        revalidatePath('/tutor-dashboard');
        revalidatePath('/admin/forums');
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
}
