'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { Functions } from 'firebase/functions';
import { initializeFirebase } from '@/firebase'; // Import the initialization function
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

// Combined state for the Firebase context
export interface FirebaseContextState {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  functions: Functions;
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

/**
 * FirebaseProvider now handles initialization internally, ensuring it runs only on the client.
 */
export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Memoize Firebase services to prevent re-initialization on re-renders
  const firebaseServices = useMemo(() => initializeFirebase(), []);

  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  // Effect to subscribe to Firebase auth state changes
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
      return () => unsubscribe(); // Cleanup subscription
    }
  }, [firebaseServices.auth]);

  // Memoize the full context value
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
      {children}
    </FirebaseContext.Provider>
  );
};

// --- Hooks ---

/** Hook to access the full Firebase context state. */
function useFirebase(): FirebaseContextState {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
}

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => useFirebase().auth;

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => useFirebase().firestore;

/** Hook to access Firebase Functions instance. */
export const useFunctions = (): Functions => useFirebase().functions;

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => useFirebase().firebaseApp;

/** Hook specifically for accessing the authenticated user's state. */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading } = useFirebase();
  return { user, isUserLoading };
};
