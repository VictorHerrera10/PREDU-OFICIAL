'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { Functions } from 'firebase/functions';
import { FirebaseStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';
import { initializeFirebase } from '@/firebase';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { useUserStatus } from '@/hooks/use-user-status';

// Combined state for the Firebase context
export interface FirebaseContextState {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  functions: Functions;
  storage: FirebaseStorage;
  rtdb: Database;
  user: User | null;
  isUserLoading: boolean;
}

// Return type for useUser()
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

const FirebaseProviderInternal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useFirebase();
  // Only track status for non-anonymous users
  useUserStatus(user && !user.isAnonymous ? user.uid : undefined);
  return <>{children}</>;
};

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const firebaseServices = useMemo(() => {
    const services = initializeFirebase();
    const rtdb = getDatabase(services.firebaseApp);
    return { ...services, rtdb };
  }, []);

  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    if (firebaseServices.auth) {
      const unsubscribe = onAuthStateChanged(
        firebaseServices.auth,
        (firebaseUser) => {
          setUser(firebaseUser);
          setIsUserLoading(false);
        },
        (error) => {
          console.error("FirebaseProvider: onAuthStateChanged error:", error);
          setUser(null);
          setIsUserLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [firebaseServices.auth]);

  const contextValue = useMemo((): FirebaseContextState => {
    return {
      ...firebaseServices,
      user,
      isUserLoading,
    };
  }, [firebaseServices, user, isUserLoading]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      <FirebaseProviderInternal>{children}</FirebaseProviderInternal>
    </FirebaseContext.Provider>
  );
};

// --- Hooks ---

function useFirebase(): FirebaseContextState {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
}

export const useAuth = (): Auth => useFirebase().auth;
export const useFirestore = (): Firestore => useFirebase().firestore;
export const useFunctions = (): Functions => useFirebase().functions;
export const useStorage = (): FirebaseStorage => useFirebase().storage;
export const useDatabase = (): Database => useFirebase().rtdb;
export const useFirebaseApp = (): FirebaseApp => useFirebase().firebaseApp;
export const useUser = (): UserHookResult => {
  const { user, isUserLoading } = useFirebase();
  return { user, isUserLoading };
};
