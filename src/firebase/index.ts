'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

// This function now robustly handles initialization for both dev and prod.
export function initializeFirebase(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } {
  if (getApps().length) {
    const app = getApp();
    return getSdks(app);
  }

  // In a client-side environment, we can directly use the firebaseConfig.
  // The previous logic was more suited for server environments and could fail locally.
  const app = initializeApp(firebaseConfig);
  initializeFirestore(app, {
    ignoreUndefinedProperties: true,
  });
  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  const firestore = getFirestore(firebaseApp);
  const functions = getFunctions(firebaseApp);

  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: firestore,
    functions: functions,
  };
}

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './errors';
export * from './error-emitter';
