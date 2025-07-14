import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase"; // make sure you already configured Firebase in firebase.ts

export interface ChatMessage {
  id?: string;
  userName: string;
  content: string;
  role: "teacher" | "student";
  timestamp: Date;
}

export const chatService = {
  sendMessage: async (
    roomCode: string,
    userName: string,
    content: string,
    role: "teacher" | "student"
  ) => {
    try {
      await addDoc(collection(db, "rooms", roomCode, "messages"), {
        userName,
        content,
        role,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  subscribeToMessages: (
    roomCode: string,
    callback: (messages: ChatMessage[]) => void
  ) => {
    const q = query(
      collection(db, "rooms", roomCode, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = snapshot.docs.map(
        (doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data();
          return {
            id: doc.id,
            userName: data.userName,
            content: data.content,
            role: data.role,
            timestamp: data.timestamp?.toDate?.() || new Date(),
          };
        }
      );
      callback(messages);
    });

    return unsubscribe;
  },
};
