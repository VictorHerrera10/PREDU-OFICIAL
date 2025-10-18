'use client';

import { useEffect } from 'react';
import { useDatabase, useFirestore } from '@/firebase';
import { ref as dbRef, onValue, goOnline, goOffline, onDisconnect, serverTimestamp, set } from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';

export function useUserStatus(userId?: string) {
    const db = useDatabase();
    const firestore = useFirestore();

    useEffect(() => {
        if (!userId || !db || !firestore) {
            return;
        }

        const userStatusDatabaseRef = dbRef(db, `/status/${userId}`);
        const userStatusFirestoreRef = doc(firestore, `/users/${userId}`);

        const isOfflineForDatabase = {
            status: 'offline',
            last_changed: serverTimestamp(),
        };

        const isOnlineForDatabase = {
            status: 'online',
            last_changed: serverTimestamp(),
        };
        
        const isOfflineForFirestore = {
            status: 'offline',
            lastSeen: new Date(),
        };

        const isOnlineForFirestore = {
            status: 'online',
        };

        const connectedRef = dbRef(db, '.info/connected');

        const unsubscribe = onValue(connectedRef, (snapshot) => {
            if (snapshot.val() === false) {
                // If not connected, update Firestore directly
                 updateDoc(userStatusFirestoreRef, isOfflineForFirestore);
                return;
            }
            
            // If we are connected
            onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
                set(userStatusDatabaseRef, isOnlineForDatabase);
                updateDoc(userStatusFirestoreRef, isOnlineForFirestore);
            });
        });
        
        return () => {
            unsubscribe();
             // Go offline before component unmounts
            goOffline(db);
        };
    }, [userId, db, firestore]);
}

    