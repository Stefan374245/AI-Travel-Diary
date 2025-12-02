import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  QuerySnapshot
} from 'firebase/firestore';
import { SavedEntry } from '../types';

const TRASH_COLLECTION = 'trash';
const DIARY_COLLECTION = 'diaryEntries';

export interface TrashEntry extends SavedEntry {
  deletedAt: string;
  originalId: string;
}

/**
 * Get user's trash collection reference
 */
const getUserTrashCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return collection(db, 'users', user.uid, TRASH_COLLECTION);
};

/**
 * Get user's diary collection reference
 */
const getUserDiaryCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return collection(db, 'users', user.uid, DIARY_COLLECTION);
};

/**
 * Move a diary entry to trash
 */
export const moveToTrash = async (entry: SavedEntry): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const trashEntry: TrashEntry = {
      ...entry,
      deletedAt: new Date().toISOString(),
      originalId: entry.id
    };

    // Add to trash collection
    const trashCollection = getUserTrashCollection();
    const trashDocRef = doc(trashCollection, entry.id);
    await setDoc(trashDocRef, trashEntry);

    // Delete from diary collection
    const diaryCollection = getUserDiaryCollection();
    const diaryDocRef = doc(diaryCollection, entry.id);
    await deleteDoc(diaryDocRef);
  } catch (error) {
    console.error('Error moving to trash:', error);
    throw error;
  }
};

/**
 * Restore an entry from trash to diary
 */
export const restoreFromTrash = async (trashEntry: TrashEntry): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // Remove trash-specific fields
    const { deletedAt, originalId, ...restoredEntry } = trashEntry;

    // Add back to diary collection
    const diaryCollection = getUserDiaryCollection();
    const diaryDocRef = doc(diaryCollection, trashEntry.id);
    await setDoc(diaryDocRef, restoredEntry);

    // Delete from trash collection
    const trashCollection = getUserTrashCollection();
    const trashDocRef = doc(trashCollection, trashEntry.id);
    await deleteDoc(trashDocRef);
  } catch (error) {
    console.error('Error restoring from trash:', error);
    throw error;
  }
};

/**
 * Permanently delete an entry from trash
 */
export const permanentDelete = async (entryId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const trashCollection = getUserTrashCollection();
    const trashDocRef = doc(trashCollection, entryId);
    await deleteDoc(trashDocRef);
  } catch (error) {
    console.error('Error permanently deleting:', error);
    throw error;
  }
};

/**
 * Load all trash entries
 */
export const loadTrashEntries = async (): Promise<TrashEntry[]> => {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const trashCollection = getUserTrashCollection();
    const q = query(trashCollection, orderBy('deletedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TrashEntry));
  } catch (error) {
    console.error('Error loading trash entries:', error);
    return [];
  }
};

/**
 * Subscribe to real-time updates of trash entries
 */
export const subscribeToTrash = (
  onUpdate: (entries: TrashEntry[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('No user authenticated for trash subscription');
      return () => {};
    }

    const trashCollection = getUserTrashCollection();
    const q = query(trashCollection, orderBy('deletedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot) => {
        const entries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TrashEntry));
        onUpdate(entries);
      },
      (error) => {
        console.error('Error in trash subscription:', error);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up trash subscription:', error);
    if (onError) onError(error as Error);
    return () => {};
  }
};

/**
 * Empty trash - permanently delete all entries
 */
export const emptyTrash = async (): Promise<void> => {
  try {
    const entries = await loadTrashEntries();
    
    for (const entry of entries) {
      await permanentDelete(entry.id);
    }
  } catch (error) {
    console.error('Error emptying trash:', error);
    throw error;
  }
};

/**
 * Auto-cleanup: Delete entries older than specified days
 */
export const cleanupOldTrashEntries = async (daysOld: number = 30): Promise<number> => {
  try {
    const entries = await loadTrashEntries();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const entriesToDelete = entries.filter(entry => 
      new Date(entry.deletedAt) < cutoffDate
    );
    
    for (const entry of entriesToDelete) {
      await permanentDelete(entry.id);
    }
    
    return entriesToDelete.length;
  } catch (error) {
    console.error('Error cleaning up old trash entries:', error);
    return 0;
  }
};

/**
 * Get trash count
 */
export const getTrashCount = async (): Promise<number> => {
  try {
    const entries = await loadTrashEntries();
    return entries.length;
  } catch (error) {
    console.error('Error getting trash count:', error);
    return 0;
  }
};
