import { db, auth, storage } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  Timestamp,
  onSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { SavedEntry } from '../types';
import { moveToTrash } from './trashService';

const COLLECTION_NAME = 'diaryEntries';

/**
 * Get user's diary collection reference
 */
const getUserDiaryCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return collection(db, 'users', user.uid, COLLECTION_NAME);
};

/**
 * Load all diary entries for the current user
 */
export const loadDiaryEntries = async (): Promise<SavedEntry[]> => {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const diaryCollection = getUserDiaryCollection();
    const q = query(diaryCollection, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SavedEntry));
  } catch (error) {
    console.error('Error loading diary entries:', error);
    return [];
  }
};

/**
 * Save a new diary entry
 */
export const saveDiaryEntry = async (entry: Omit<SavedEntry, 'id' | 'timestamp'>): Promise<SavedEntry> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const entryId = new Date().toISOString() + Math.random();
    const timestamp = new Date().toISOString();

    // Upload image to Firebase Storage
    const imageRef = ref(storage, `users/${user.uid}/diary-images/${entryId}.jpg`);
    await uploadString(imageRef, entry.imagePreview, 'data_url');
    const imageUrl = await getDownloadURL(imageRef);

    const newEntry: SavedEntry = {
      ...entry,
      imagePreview: imageUrl, // Store the download URL instead of base64
      id: entryId,
      timestamp: timestamp,
    };

    const diaryCollection = getUserDiaryCollection();
    const docRef = doc(diaryCollection, newEntry.id);
    await setDoc(docRef, newEntry);

    return newEntry;
  } catch (error) {
    console.error('Error saving diary entry:', error);
    throw error;
  }
};

/**
 * Update an existing diary entry
 */
export const updateDiaryEntry = async (entry: SavedEntry): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const diaryCollection = getUserDiaryCollection();
    const docRef = doc(diaryCollection, entry.id);
    await updateDoc(docRef, { ...entry });
  } catch (error) {
    console.error('Error updating diary entry:', error);
    throw error;
  }
};

/**
 * Delete a diary entry (moves to trash)
 */
export const deleteDiaryEntry = async (entryId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Load the entry first
    const diaryCollection = getUserDiaryCollection();
    const docRef = doc(diaryCollection, entryId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const entry = { id: docSnap.id, ...docSnap.data() } as SavedEntry;
      // Move to trash instead of permanent delete
      await moveToTrash(entry);
    } else {
      throw new Error('Entry not found');
    }
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates of diary entries
 */
export const subscribeToDiaryEntries = (
  onUpdate: (entries: SavedEntry[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('No user authenticated for diary subscription');
      return () => {};
    }

    const diaryCollection = getUserDiaryCollection();
    const q = query(diaryCollection, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const entries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SavedEntry));
        onUpdate(entries);
      },
      (error) => {
        console.error('Error in diary subscription:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up diary subscription:', error);
    if (onError) onError(error as Error);
    return () => {};
  }
};

/**
 * Get count of diary entries
 */
export const getDiaryEntryCount = async (): Promise<number> => {
  try {
    const entries = await loadDiaryEntries();
    return entries.length;
  } catch (error) {
    console.error('Error getting diary entry count:', error);
    return 0;
  }
};
