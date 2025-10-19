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
                
                // When I disconnect, update both RTDB and Firestore.
                onDisconnect(userStatusDatabaseRef).set({
                    status: 'offline',
                    last_changed: serverTimestamp(),
                }).then(() => {
                    // This is a server-side operation that will execute when the client disconnects.
                    // We need to tell the server to update Firestore as well.
                    // The onDisconnect for RTDB can trigger a Cloud Function, but for a client-only solution,
                    // we'll update firestore when we know we're disconnected.
                });

                // Set the Firestore status to online.
                updateDoc(userStatusFirestoreRef, {
                    status: 'online',
                    lastSeen: firestoreServerTimestamp() // Update lastSeen on connect as well
                });

            } else {
                // We're not connected. This can be triggered by calling goOffline().
                // We'll update Firestore here for a graceful disconnect.
                updateDoc(userStatusFirestoreRef, {
                    status: 'offline',
                    lastSeen: firestoreServerTimestamp(),
                });
            }
        });
        
        return () => {
            unsubscribe();
            // On cleanup (e.g. user logs out or component unmounts), explicitly set offline status
            // This is the "graceful" shutdown part.
             rtdbSet(userStatusDatabaseRef, {
                status: 'offline',
                last_changed: serverTimestamp(),
            });
            updateDoc(userStatusFirestoreRef, {
                status: 'offline',
                lastSeen: firestoreServerTimestamp(),
            });
            goOffline(db);
        };
    }, [userId, db, firestore]);
}
