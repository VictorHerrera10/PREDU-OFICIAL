'use server';

import {
  doc,
  setDoc,
  serverTimestamp,
  updateDoc,
  addDoc,
  collection,
} from 'firebase/firestore';
import { getAuthenticatedAppForUser } from './utils';

export async function sendMessage(chatId: string, messageData: { text: string, senderId: string, receiverId: string }) {
    const { firestore } = await getAuthenticatedAppForUser();
    
    const messagesColRef = collection(firestore, 'chats', chatId, 'messages');
    const chatDocRef = doc(firestore, 'chats', chatId);

    try {
        await addDoc(messagesColRef, {
            ...messageData,
            timestamp: serverTimestamp(),
            isRead: false,
        });

        // Update the last message on the parent chat document
        await setDoc(chatDocRef, {
            participants: [messageData.senderId, messageData.receiverId],
            lastMessage: {
                text: messageData.text,
                senderId: messageData.senderId,
                timestamp: serverTimestamp(),
                isRead: false,
            }
        }, { merge: true });


        return { success: true };
    } catch (error: any) {
        console.error("Error sending message:", error);
        return { success: false, message: "Could not send message. " + error.message };
    }
}

export async function markChatAsRead(chatId: string) {
    const { firestore } = await getAuthenticatedAppForUser();
    const chatDocRef = doc(firestore, 'chats', chatId);

    try {
        await updateDoc(chatDocRef, {
            'lastMessage.isRead': true
        });
        return { success: true };
    } catch (error: any) {
        // Don't show toast for this as it's a background action
        console.error("Error marking chat as read:", error);
        return { success: false, message: "Could not mark chat as read." };
    }
}
