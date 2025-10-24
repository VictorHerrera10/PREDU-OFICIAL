'use server';

import {
  doc,
  serverTimestamp,
  updateDoc,
  addDoc,
  collection,
  deleteDoc,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import { getAuthenticatedAppForUser } from './utils';

// We define this here because it's specific to this domain
export type QuestionFormData = {
  text: string;
  gifUrl: string;
  section: 'actividades' | 'habilidades' | 'ocupaciones';
  category: 'realista' | 'investigador' | 'artistico' | 'social' | 'emprendedor' | 'convencional';
};

export async function createPsychologicalQuestion(data: QuestionFormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  // TODO: Add admin role check
  try {
    const docRef = await addDoc(collection(firestore, 'psychological_questions'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    revalidatePath('/admin/psychological-test');
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, message: 'No se pudo crear la pregunta. ' + error.message };
  }
}

export async function updatePsychologicalQuestion(id: string, data: QuestionFormData) {
  const { firestore } = await getAuthenticatedAppForUser();
  // TODO: Add admin role check
  try {
    const questionRef = doc(firestore, 'psychological_questions', id);
    await updateDoc(questionRef, {
        ...data,
        updatedAt: serverTimestamp()
    });
    revalidatePath('/admin/psychological-test');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: 'No se pudo actualizar la pregunta. ' + error.message };
  }
}

export async function deletePsychologicalQuestion(id: string) {
  const { firestore } = await getAuthenticatedAppForUser();
  // TODO: Add admin role check
  try {
    const questionRef = doc(firestore, 'psychological_questions', id);
    await deleteDoc(questionRef);
    revalidatePath('/admin/psychological-test');
    return { success: true };
  } catch (error: any) {
    return { success: false, message: 'No se pudo eliminar la pregunta. ' + error.message };
  }
}
