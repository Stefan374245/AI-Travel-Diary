import { SavedFlashcard, Flashcard } from '../types';

const STORAGE_KEY = 'savedFlashcards';

/**
 * Lädt alle gespeicherten Lernkarten aus LocalStorage
 */
export const loadFlashcards = (): SavedFlashcard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Fehler beim Laden der Lernkarten:', error);
  }
  return [];
};

/**
 * Speichert eine neue Lernkarte
 */
export const saveFlashcard = (flashcard: Flashcard, category?: string): SavedFlashcard => {
  const savedCard: SavedFlashcard = {
    ...flashcard,
    id: new Date().toISOString() + Math.random(),
    timestamp: new Date().toISOString(),
    category,
  };

  const existingCards = loadFlashcards();
  
  // Prüfe, ob die Karte bereits existiert (gleicher spanischer Text)
  const duplicate = existingCards.find(card => card.es === flashcard.es);
  if (duplicate) {
    return duplicate;
  }

  const updatedCards = [savedCard, ...existingCards];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
  
  return savedCard;
};

/**
 * Löscht eine Lernkarte anhand ihrer ID
 */
export const deleteFlashcard = (id: string): void => {
  const cards = loadFlashcards();
  const filtered = cards.filter(card => card.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Prüft, ob eine Lernkarte bereits gespeichert ist
 */
export const isFlashcardSaved = (flashcard: Flashcard): boolean => {
  const cards = loadFlashcards();
  return cards.some(card => card.es === flashcard.es);
};

/**
 * Zählt die Anzahl gespeicherter Lernkarten
 */
export const getFlashcardCount = (): number => {
  return loadFlashcards().length;
};
