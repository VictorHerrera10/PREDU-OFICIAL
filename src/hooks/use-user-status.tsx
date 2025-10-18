'use client';

import { useEffect } from 'react';
import { useDatabase, useFirestore } from '@/firebase';
import { ref as dbRef, onValue, goOffline, onDisconnect, serverTimestamp, goOnline, set as rtdbSet } from 'firebase/database';
import { doc, updateDoc, serverTimestamp as firestoreServerTimestamp } from 'firebase/firestore';

export function useUserStatus(userId?: string) {
    const db = useDatabase();
    const firestore = useFirestore();

    useEffect(() => {
        if (!userId || !db || !firestore) {
            return;
        }

        const userStatusDatabaseRef = dbRef(db, `/status/${userId}`);
        const userStatusFirestoreRef = doc(firestore, `/users/${userId}`);
        const connectedRef = dbRef(db, '.info/connected');

        goOnline(db);

        const unsubscribe = onValue(connectedRef, (snapshot) => {
            if (snapshot.val() === true) {
                // We're connected.
                const conStatus = {
                    status: 'online',
                    last_changed: serverTimestamp(),
                };
                rtdbSet(userStatusDatabaseRef, conStatus);
                updateDoc(userStatusFirestoreRef, { status: 'online' });

                // When I disconnect, set my status to 'offline'.
                onDisconnect(userStatusDatabaseRef).set({
                    status: 'offline',
                    last_changed: serverTimestamp(),
                });
                
                onDisconnect(userStatusFirestoreRef).update({
                    status: 'offline',
                    lastSeen: firestoreServerTimestamp(),
                });

            } else {
                // We're not connected. In a moment, onDisconnect will fire.
                // We can also preemptively update firestore if we want.
                updateDoc(userStatusFirestoreRef, {
                    status: 'offline',
                    lastSeen: firestoreServerTimestamp(),
                });
            }
        });
        
        return () => {
            unsubscribe();
             // On cleanup (e.g. user logs out), explicitly set offline status.
            updateDoc(userStatusFirestoreRef, {
                status: 'offline',
                lastSeen: firestoreServerTimestamp(),
            });
            goOffline(db);
        };
    }, [userId, db, firestore]);
}
