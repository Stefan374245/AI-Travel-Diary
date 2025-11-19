import { SavedFlashcard, Flashcard } from '../types';

const STORAGE_KEY = 'savedFlashcards';

/**
 * Berechnet das nächste Review-Datum basierend auf der Box
 */
const calculateNextReview = (box: number): string => {
  const now = new Date();
  const daysToAdd = [1, 2, 5, 10, 30][box - 1] || 1; // Box 1-5 entspricht 1,2,5,10,30 Tage
  now.setDate(now.getDate() + daysToAdd);
  return now.toISOString();
};

/**
 * Lädt alle gespeicherten Lernkarten aus LocalStorage
 */
export const loadFlashcards = (): SavedFlashcard[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const cards = JSON.parse(stored);
      // Migration: Alte Karten ohne box-System aktualisieren
      return cards.map((card: SavedFlashcard) => ({
        ...card,
        box: card.box || 1,
        lastReviewed: card.lastReviewed || null,
        nextReview: card.nextReview || calculateNextReview(1),
        reviewCount: card.reviewCount || 0,
      }));
    }
  } catch (error) {
    console.error('Fehler beim Laden der Lernkarten:', error);
  }
  return [];
};

/**
 * Speichert eine neue Lernkarte
 */
export const saveFlashcard = (
  flashcard: Flashcard, 
  category?: string,
  entryData?: { entryId: string; imageUrl: string; location: string }
): SavedFlashcard => {
  const now = new Date().toISOString();
  const savedCard: SavedFlashcard = {
    ...flashcard,
    id: now + Math.random(),
    timestamp: now,
    category,
    box: 1,
    lastReviewed: null,
    nextReview: calculateNextReview(1),
    reviewCount: 0,
    entryId: entryData?.entryId,
    location: entryData?.location,
    // imageUrl NICHT speichern - wird dynamisch aus savedEntries geladen
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
 * Löscht eine Lernkarte anhand des spanischen Textes
 */
export const deleteFlashcardByText = (spanishText: string): void => {
  const cards = loadFlashcards();
  const filtered = cards.filter(card => card.es !== spanishText);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Zählt die Anzahl gespeicherter Lernkarten
 */
export const getFlashcardCount = (): number => {
  return loadFlashcards().length;
};

/**
 * Aktualisiert eine Lernkarte nach dem Review (richtig oder falsch)
 */
export const reviewFlashcard = (id: string, correct: boolean): void => {
  const cards = loadFlashcards();
  const updatedCards = cards.map(card => {
    if (card.id === id) {
      const now = new Date().toISOString();
      if (correct) {
        // Richtig: Box erhöhen (max 5) und reviewCount erhöhen
        const newBox = Math.min(card.box + 1, 5);
        return {
          ...card,
          box: newBox,
          lastReviewed: now,
          nextReview: calculateNextReview(newBox),
          reviewCount: card.reviewCount + 1,
        };
      } else {
        // Falsch: Zurück zu Box 1
        return {
          ...card,
          box: 1,
          lastReviewed: now,
          nextReview: calculateNextReview(1),
        };
      }
    }
    return card;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
};

/**
 * Gibt alle fälligen Karten zurück (nextReview <= jetzt)
 */
export const getDueFlashcards = (): SavedFlashcard[] => {
  const now = new Date();
  return loadFlashcards().filter(card => new Date(card.nextReview) <= now);
};

/**
 * Statistik: Anzahl Karten pro Box
 */
export const getFlashcardStats = () => {
  const cards = loadFlashcards();
  const stats = {
    total: cards.length,
    box1: cards.filter(c => c.box === 1).length,
    box2: cards.filter(c => c.box === 2).length,
    box3: cards.filter(c => c.box === 3).length,
    box4: cards.filter(c => c.box === 4).length,
    box5: cards.filter(c => c.box === 5).length,
    due: getDueFlashcards().length,
  };
  return stats;
};
