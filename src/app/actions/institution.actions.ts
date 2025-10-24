'use server';

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
import { revalidatePath } from 'next/cache';
import { getAuthenticatedAppForUser, generateUniqueCode } from './utils';

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
  // redirect('/admin/institutions');
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
