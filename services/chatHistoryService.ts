import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';
import { ChatMessage } from '../types';

const COLLECTION_NAME = 'chatHistory';
const MAX_SAVED_CHATS = 5;

export interface SavedChat {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: string;
  languageLevel?: string;
}

/**
 * Get user's chat collection reference
 */
const getUserChatCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return collection(db, 'users', user.uid, COLLECTION_NAME);
};

/**
 * Load all saved chat sessions (limited to last 5)
 */
export const loadChatHistory = async (): Promise<SavedChat[]> => {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const chatCollection = getUserChatCollection();
    const q = query(chatCollection, orderBy('timestamp', 'desc'), limit(MAX_SAVED_CHATS));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SavedChat));
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
};

/**
 * Save current chat session
 */
export const saveChatSession = async (
  messages: ChatMessage[], 
  languageLevel?: string
): Promise<SavedChat> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Generate title from first user message or use default
    const firstUserMessage = messages.find(m => m.role === 'user');
    const title = firstUserMessage 
      ? firstUserMessage.parts[0].text.substring(0, 50) + (firstUserMessage.parts[0].text.length > 50 ? '...' : '')
      : 'Neue Unterhaltung';

    const chatSession: SavedChat = {
      id: new Date().toISOString() + Math.random(),
      title,
      messages,
      timestamp: new Date().toISOString(),
      languageLevel
    };

    const chatCollection = getUserChatCollection();
    const docRef = doc(chatCollection, chatSession.id);
    await setDoc(docRef, chatSession);

    // Keep only last 5 chats - delete older ones
    await cleanupOldChats();

    return chatSession;
  } catch (error) {
    console.error('Error saving chat session:', error);
    throw error;
  }
};

/**
 * Delete a chat session
 */
export const deleteChatSession = async (chatId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const chatCollection = getUserChatCollection();
    const docRef = doc(chatCollection, chatId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting chat session:', error);
    throw error;
  }
};

/**
 * Clean up old chats, keeping only the last 5
 */
const cleanupOldChats = async (): Promise<void> => {
  try {
    const chats = await loadChatHistory();
    
    // If we have more than MAX_SAVED_CHATS, delete the oldest ones
    if (chats.length > MAX_SAVED_CHATS) {
      const chatsToDelete = chats.slice(MAX_SAVED_CHATS);
      
      for (const chat of chatsToDelete) {
        await deleteChatSession(chat.id);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old chats:', error);
  }
};
