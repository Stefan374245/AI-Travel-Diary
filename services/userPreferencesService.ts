import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LanguageLevel } from '../types';

const COLLECTION = 'userSettings';

/**
 * Get user's language level preference
 */
export const getUserLanguageLevel = async (): Promise<LanguageLevel> => {
  const user = auth.currentUser;
  if (!user) return 'A2'; // Default level
  
  try {
    const docRef = doc(db, COLLECTION, user.uid);
    const snap = await getDoc(docRef);
    
    if (snap.exists()) {
      const data = snap.data();
      return (data.languageLevel as LanguageLevel) || 'A2';
    }
    return 'A2';
  } catch (error) {
    console.error('Error loading language level:', error);
    return 'A2';
  }
};

/**
 * Save user's language level preference
 */
export const saveUserLanguageLevel = async (level: LanguageLevel): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;
  
  try {
    const docRef = doc(db, COLLECTION, user.uid);
    await setDoc(docRef, { languageLevel: level }, { merge: true });
  } catch (error) {
    console.error('Error saving language level:', error);
  }
};
