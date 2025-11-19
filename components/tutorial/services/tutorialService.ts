/**
 * Tutorial Service - LocalStorage Management
 * Handles tutorial state persistence
 */

const TUTORIAL_STORAGE_KEY = 'ai-travel-diary-tutorial-completed';
const TUTORIAL_SKIPPED_KEY = 'ai-travel-diary-tutorial-skipped';

export const tutorialService = {
  /**
   * Check if user has completed or skipped the tutorial
   */
  hasSeenTutorial(): boolean {
    try {
      const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY);
      const skipped = localStorage.getItem(TUTORIAL_SKIPPED_KEY);
      return completed === 'true' || skipped === 'true';
    } catch (error) {
      console.error('Error reading tutorial state:', error);
      return false;
    }
  },

  /**
   * Mark tutorial as completed
   */
  markAsCompleted(): void {
    try {
      localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true');
      localStorage.removeItem(TUTORIAL_SKIPPED_KEY);
    } catch (error) {
      console.error('Error saving tutorial completion:', error);
    }
  },

  /**
   * Mark tutorial as skipped
   */
  markAsSkipped(): void {
    try {
      localStorage.setItem(TUTORIAL_SKIPPED_KEY, 'true');
      localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    } catch (error) {
      console.error('Error saving tutorial skip:', error);
    }
  },

  /**
   * Reset tutorial state (for testing or user request)
   */
  resetTutorial(): void {
    try {
      localStorage.removeItem(TUTORIAL_STORAGE_KEY);
      localStorage.removeItem(TUTORIAL_SKIPPED_KEY);
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  },
};
