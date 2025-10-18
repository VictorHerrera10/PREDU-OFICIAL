'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions';
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage';

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
  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);
  const functions = getFunctions(firebaseApp);
  const storage = getStorage(firebaseApp);

  if (process.env.NODE_ENV === 'development') {
    // Point to the emulators running on localhost.
    // IMPORTANT: Make sure you have the emulators running!
    // connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    // connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
    // connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    // connectStorageEmulator(storage, '127.0.0.1', 9199);
  }

  return {
    firebaseApp,
    auth,
    firestore,
    functions,
    storage,
  };
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
export * from '../hooks/use-user-status';

    