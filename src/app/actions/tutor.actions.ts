'use server';

import {
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  limit,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedAppForUser, generateUniqueCode, getFirebaseErrorMessage, type State } from './utils';
import { redirect } from 'next/navigation';

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
