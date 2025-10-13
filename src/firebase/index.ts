'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';
// Importamos el tipo FirebaseStorage, no solo Storage.
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Esta función maneja de forma robusta la inicialización tanto para desarrollo como para producción.
// Usamos FirebaseStorage como el tipo correcto para 'storage'.
export function initializeFirebase(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore, functions: Functions, storage: FirebaseStorage } {
  if (getApps().length) {
    const app = getApp();
    return getSdks(app);
  }

  const app = initializeApp(firebaseConfig);
  initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  });
  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const functions = getFunctions(firebaseApp);
  // getStorage devuelve el objeto FirebaseStorage
  const storage = getStorage(firebaseApp);

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: firestore,
    functions: functions,
    storage: storage,
  };
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';