import { db, auth } from '../../../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const COLLECTION = 'userSettings';

export const tutorialService = {
  /**
   * Check if user has completed or skipped the tutorial
   */
  async hasSeenTutorial(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    try {
      const docRef = doc(db, COLLECTION, user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        return data.tutorialCompleted === true || data.tutorialSkipped === true;
      }
      return false;
    } catch (error) {
      console.error('Error reading tutorial state:', error);
      return false;
    }
  },

  /**
   * Mark tutorial as completed
   */
  async markAsCompleted(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const docRef = doc(db, COLLECTION, user.uid);
      await setDoc(docRef, { tutorialCompleted: true }, { merge: true });
    } catch (error) {
      console.error('Error saving tutorial completion:', error);
    }
  },

  /**
   * Mark tutorial as skipped
   */
  async markAsSkipped(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const docRef = doc(db, COLLECTION, user.uid);
      await setDoc(docRef, { tutorialSkipped: true }, { merge: true });
    } catch (error) {
      console.error('Error saving tutorial skip:', error);
    }
  },

  /**
   * Reset tutorial state (for testing or user request)
   */
  async resetTutorial(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const docRef = doc(db, COLLECTION, user.uid);
      await setDoc(docRef, { tutorialCompleted: false, tutorialSkipped: false }, { merge: true });
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  },
};
