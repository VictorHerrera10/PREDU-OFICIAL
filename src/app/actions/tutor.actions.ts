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
import api from '@/lib/api-client';

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
        
        // --- INTEGRACIÓN DEL ENDPOINT /enviar-codigo/ ---
        try {
          await api.post('/enviar-codigo/', {
            email: requestData.email,
            nombre_estudiante: requestData.firstName, // Using tutor's first name
            institucion: groupData.name, // The group name is the institution
            region: groupData.region,
            unique_code: groupData.uniqueCode,
            director_name: groupData.tutorName, // The tutor is the "director" of the group
            teaching_modality: 'independiente', // Use a placeholder or appropriate value
          });
        } catch (emailError: any) {
            // Log the error but don't block the main success message
            console.error('Failed to send tutor welcome email:', emailError.message);
        }

        // --- INTEGRACIÓN DEL ENDPOINT /enviar-bienvenida-tutor/ ---
        try {
            await api.post('/enviar-bienvenida-tutor/', {
                email: requestData.email,
                nombre_tutor: requestData.firstName,
                institucion: groupData.name,
                logo_url: '', // No logo for independent tutors
                enlace_panel: '/tutor-dashboard',
            });
        } catch (emailError: any) {
             console.error('Failed to send tutor welcome email:', emailError.message);
        }
        // --- FIN DE LA INTEGRACIÓN ---

        // --- INTEGRACIÓN DEL ENDPOINT /enviar-tutor-cuenta-aprobada/ ---
        try {
            const approvalDate = new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            await api.post('/enviar-tutor-cuenta-aprobada/', {
                email: requestData.email,
                nombre_tutor: requestData.firstName,
                fecha_aprobacion: approvalDate,
                logo_url: '', // No logo for independent tutors
            });
        } catch (emailError: any) {
            console.error('Failed to send tutor account approval email:', emailError.message);
        }
        // --- FIN DE LA INTEGRACIÓN ---

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

export async function rejectTutorRequestWithReason(requestId: string, reason: string) {
    const { firestore } = await getAuthenticatedAppForUser();
    const requestRef = doc(firestore, 'tutorRequests', requestId);

    if (!reason.trim()) {
        return { success: false, message: "El motivo del rechazo no puede estar vacío." };
    }

    try {
        const requestSnap = await getDoc(requestRef);
        if (!requestSnap.exists()) {
            throw new Error("Solicitud no encontrada.");
        }
        const requestData = requestSnap.data();

        await updateDoc(requestRef, { status: 'rejected' });
        
        try {
            const reviewDate = new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            await api.post('/enviar-tutor-cuenta-rechazada/', {
                email: requestData.email,
                nombre_tutor: requestData.firstName,
                motivo_rechazo: reason,
                fecha_revision: reviewDate,
                logo_url: '', // No logo for independent tutors
            });
        } catch (emailError: any) {
             console.error("Failed to send rejection email:", emailError.message);
            // Don't block the main flow, but maybe log it
        }

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


export async function sendTutorValidation(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const studentName = formData.get('studentName') as string;
    const tutorName = formData.get('tutorName') as string;
    const tutorAdvice = formData.get('tutorAdvice') as string;

    if (!email || !studentName || !tutorName || !tutorAdvice) {
        return { success: false, message: 'Faltan datos para enviar la validación.' };
    }

    try {
        await api.post('/enviar-validacion-tutor/', {
            email: email,
            nombre_estudiante: studentName,
            nombre_tutor: tutorName,
            consejo_tutor: tutorAdvice,
        });
        return { success: true, message: 'Correo de validación enviado con éxito.' };
    } catch (error: any) {
        console.error('Failed to send tutor validation email:', error.message);
        return { success: false, message: 'No se pudo enviar el correo. Inténtalo más tarde.' };
    }
}

export async function sendAcademicValidation(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const studentName = formData.get('studentName') as string;
    const tutorName = formData.get('tutorName') as string;
    const tutorAdvice = formData.get('tutorAdvice') as string;

    if (!email || !studentName || !tutorName || !tutorAdvice) {
        return { success: false, message: 'Faltan datos para enviar la validación académica.' };
    }

    try {
        await api.post('/enviar-validacion-academica-tutor/', {
            email: email,
            nombre_estudiante: studentName,
            nombre_tutor: tutorName,
            consejo_tutor: tutorAdvice,
        });
        return { success: true, message: 'Correo de validación académica enviado con éxito.' };
    } catch (error: any) {
        console.error('Failed to send academic validation email:', error.message);
        return { success: false, message: 'No se pudo enviar el correo de validación académica. Inténtalo más tarde.' };
    }
}

export async function sendPsychologicalValidation(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const studentName = formData.get('studentName') as string;
    const tutorName = formData.get('tutorName') as string;
    const tutorAdvice = formData.get('tutorAdvice') as string;

    if (!email || !studentName || !tutorName || !tutorAdvice) {
        return { success: false, message: 'Faltan datos para enviar la validación psicológica.' };
    }

    try {
        await api.post('/enviar-validacion-psicologica-tutor/', {
            email: email,
            nombre_estudiante: studentName,
            nombre_tutor: tutorName,
            consejo_tutor: tutorAdvice,
        });
        return { success: true, message: 'Correo de validación psicológica enviado con éxito.' };
    } catch (error: any) {
        console.error('Failed to send psychological validation email:', error.message);
        return { success: false, message: 'No se pudo enviar el correo de validación psicológica. Inténtalo más tarde.' };
    }
}

export async function sendTutorWelcomeEmail(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const tutorName = formData.get('tutorName') as string;
    const institution = formData.get('institution') as string;
    const logoUrl = formData.get('logoUrl') as string;
    const panelLink = formData.get('panelLink') as string;

    if (!email || !tutorName || !institution) {
        return { success: false, message: 'Faltan datos para enviar el correo de bienvenida.' };
    }

    try {
        await api.post('/enviar-bienvenida-tutor/', {
            email: email,
            nombre_tutor: tutorName,
            institucion: institution,
            logo_url: logoUrl || '',
            enlace_panel: panelLink || '/tutor-dashboard',
        });
        return { success: true, message: 'Correo de bienvenida para tutor enviado con éxito.' };
    } catch (error: any) {
        console.error('Failed to send tutor welcome email:', error.message);
        return { success: false, message: 'No se pudo enviar el correo de bienvenida. Inténtalo más tarde.' };
    }
}
