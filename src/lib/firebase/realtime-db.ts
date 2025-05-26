// src/lib/firebase/realtime-db.ts
import { db } from './config';
import { ref, set, onValue, push, serverTimestamp, off, type DataSnapshot, query, orderByChild, limitToLast } from 'firebase/database';
import type { User } from 'firebase/auth';

export interface Message {
  id: string;
  text: string;
  timestamp: number;
  userId?: string; 
  userName?: string;
}

const MESSAGES_PATH = 'messages';

export async function addMessage(messageText: string, user: User | null): Promise<void> {
  if (!messageText.trim()) {
    throw new Error('Message text cannot be empty.');
  }
  try {
    const messagesRef = ref(db, MESSAGES_PATH);
    const newMessageRef = push(messagesRef); // Generates a unique ID
    
    const messageData: { text: string; timestamp: object; userId?: string; userName?: string } = {
      text: messageText,
      timestamp: serverTimestamp(),
    };

    if (user) {
      messageData.userId = user.uid;
      messageData.userName = user.displayName || user.email || 'Anonymous';
    } else {
      messageData.userName = 'Guest';
    }

    await set(newMessageRef, messageData);
  } catch (error) {
    console.error("Error adding message to Realtime Database:", error);
    throw error;
  }
}

export function subscribeToMessages(callback: (messages: Message[]) => void, messageLimit: number = 25): () => void {
  const messagesQuery = query(ref(db, MESSAGES_PATH), orderByChild('timestamp'), limitToLast(messageLimit));
  
  const listener = onValue(messagesQuery, (snapshot: DataSnapshot) => {
    const messagesData = snapshot.val();
    if (messagesData) {
      const messagesList: Message[] = Object.keys(messagesData).map(key => ({
        id: key,
        ...messagesData[key]
      })).sort((a, b) => a.timestamp - b.timestamp); // Sort by oldest first for typical chat display
      callback(messagesList);
    } else {
      callback([]); // No messages
    }
  }, (error) => {
    console.error("Error subscribing to messages:", error);
    // Optionally, inform the user via toast or other UI element
    callback([]); // Send empty list on error
  });

  // Return an unsubscribe function
  return () => off(messagesQuery, 'value', listener);
}
