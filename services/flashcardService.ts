import { SavedFlashcard, Flashcard } from '../types';
import { db, auth } from './firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'flashcards';

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
 * Lädt alle gespeicherten Lernkarten aus Firestore
 */
export const loadFlashcards = async (): Promise<SavedFlashcard[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(collection(db, COLLECTION_NAME), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedFlashcard));
  } catch (error) {
    console.error('Fehler beim Laden der Lernkarten:', error);
    return [];
  }
};

/**
 * Speichert eine neue Lernkarte
 */
export const saveFlashcard = async (
  flashcard: Flashcard, 
  category?: string,
  entryData?: { entryId: string; imageUrl: string; location: string }
): Promise<SavedFlashcard | null> => {
  const user = auth.currentUser;
  if (!user) return null;

  const now = new Date().toISOString();
  const newCardData = {
    ...flashcard,
    timestamp: now,
    category,
    box: 1,
    lastReviewed: null,
    nextReview: calculateNextReview(1),
    reviewCount: 0,
    entryId: entryData?.entryId,
    location: entryData?.location,
    userId: user.uid
    // imageUrl NICHT speichern - wird dynamisch aus savedEntries geladen
  };

  try {
    // Prüfe, ob die Karte bereits existiert (gleicher spanischer Text)
    const existingCards = await loadFlashcards();
    const duplicate = existingCards.find(card => card.es === flashcard.es);
    if (duplicate) {
      return duplicate;
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), newCardData);
    return { ...newCardData, id: docRef.id } as SavedFlashcard;
  } catch (error) {
    console.error('Fehler beim Speichern der Lernkarte:', error);
    return null;
  }
};

/**
 * Löscht eine Lernkarte anhand ihrer ID
 */
export const deleteFlashcard = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Fehler beim Löschen der Lernkarte:', error);
  }
};

/**
 * Prüft, ob eine Lernkarte bereits gespeichert ist
 */
export const isFlashcardSaved = async (flashcard: Flashcard): Promise<boolean> => {
  const cards = await loadFlashcards();
  return cards.some(card => card.es === flashcard.es);
};

/**
 * Löscht eine Lernkarte anhand des spanischen Textes
 */
export const deleteFlashcardByText = async (spanishText: string): Promise<void> => {
  const cards = await loadFlashcards();
  const cardToDelete = cards.find(card => card.es === spanishText);
  if (cardToDelete) {
    await deleteFlashcard(cardToDelete.id);
  }
};

/**
 * Zählt die Anzahl gespeicherter Lernkarten
 */
export const getFlashcardCount = async (): Promise<number> => {
  const cards = await loadFlashcards();
  return cards.length;
};

/**
 * Aktualisiert eine Lernkarte nach dem Review (richtig oder falsch)
 */
export const reviewFlashcard = async (id: string, correct: boolean): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const card = docSnap.data() as SavedFlashcard;
      const now = new Date().toISOString();
      let updates = {};

      if (correct) {
        // Richtig: Box erhöhen (max 5) und reviewCount erhöhen
        const newBox = Math.min(card.box + 1, 5);
        updates = {
          box: newBox,
          lastReviewed: now,
          nextReview: calculateNextReview(newBox),
          reviewCount: (card.reviewCount || 0) + 1,
        };
      } else {
        // Falsch: Zurück zu Box 1
        updates = {
          box: 1,
          lastReviewed: now,
          nextReview: calculateNextReview(1),
        };
      }
      
      await updateDoc(docRef, updates);
    }
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Lernkarte:', error);
  }
};

/**
 * Gibt alle fälligen Karten zurück (nextReview <= jetzt)
 */
export const getDueFlashcards = async (): Promise<SavedFlashcard[]> => {
  const now = new Date();
  const cards = await loadFlashcards();
  return cards.filter(card => new Date(card.nextReview) <= now);
};

/**
 * Statistik: Anzahl Karten pro Box
 */
export const getFlashcardStats = async () => {
  const cards = await loadFlashcards();
  const dueCards = await getDueFlashcards();
  
  const stats = {
    total: cards.length,
    box1: cards.filter(c => c.box === 1).length,
    box2: cards.filter(c => c.box === 2).length,
    box3: cards.filter(c => c.box === 3).length,
    box4: cards.filter(c => c.box === 4).length,
    box5: cards.filter(c => c.box === 5).length,
    due: dueCards.length,
  };
  return stats;
};
