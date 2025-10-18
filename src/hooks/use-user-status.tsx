'use client';

import { useEffect } from 'react';
import { useDatabase, useFirestore } from '@/firebase';
import { ref as dbRef, onValue, goOffline, onDisconnect, serverTimestamp } from 'firebase/database';
import { doc } from 'firebase/firestore';
import { setRealtimeDatabaseNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

export function useUserStatus(userId?: string) {
    const db = useDatabase();
    const firestore = useFirestore();

    useEffect(() => {
        if (!userId || !db || !firestore) {
            return;
        }

        const userStatusDatabasePath = `/status/${userId}`;
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
                updateDocumentNonBlocking(userStatusFirestoreRef, isOfflineForFirestore);
                return;
            }
            
            const con = dbRef(db, userStatusDatabasePath);
            onDisconnect(con).set(isOfflineForDatabase).then(() => {
                setRealtimeDatabaseNonBlocking(db, userStatusDatabasePath, isOnlineForDatabase);
                updateDocumentNonBlocking(userStatusFirestoreRef, isOnlineForFirestore);
            });
        });
        
        return () => {
            unsubscribe();
            goOffline(db);
        };
    }, [userId, db, firestore]);
}
