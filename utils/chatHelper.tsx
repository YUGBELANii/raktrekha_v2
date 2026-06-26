import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { db } from "../firebase";

// This function either finds an existing chat or creates a new one
export const createOrFetchChatId = async (userId: string, otherUserId: string) => {
  try {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", userId)
    );

    const snapshot = await getDocs(q);
    let existingChatId = null;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.participants.includes(otherUserId)) {
        existingChatId = docSnap.id;
      }
    });

    if (existingChatId) {
      return existingChatId;
    }

    // If no chat exists, create one
    const newChatRef = doc(chatsRef);
    await setDoc(newChatRef, {
      participants: [userId, otherUserId],
      createdAt: new Date(),
    });

    return newChatRef.id;
  } catch (error) {
    console.error("Error creating/fetching chat:", error);
    throw error;
  }
};
