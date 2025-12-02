import { VocabularyEntry, Flashcard } from '../types';
import { db, auth } from './firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { saveFlashcard } from './flashcardService';

const COLLECTION_NAME = 'vocabulary';

/**
 * Get user's vocabulary collection reference
 */
const getUserVocabularyCollection = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return collection(db, 'users', user.uid, COLLECTION_NAME);
};

/**
 * Importiert Vokabeln in die Firestore-Datenbank
 */
export const importVocabulary = async (
  vocabList: Array<{ es: string; de: string }>,
  category: string
): Promise<VocabularyEntry[]> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    const vocabularyCollection = getUserVocabularyCollection();
    const now = new Date().toISOString();
    const importedEntries: VocabularyEntry[] = [];

    // Prüfe auf Duplikate
    const existingVocab = await loadVocabulary();
    
    for (const vocab of vocabList) {
      // Überspringe Duplikate (gleicher spanischer Text)
      const duplicate = existingVocab.find(v => v.es.toLowerCase() === vocab.es.toLowerCase());
      if (duplicate) {
        importedEntries.push(duplicate);
        continue;
      }

      const vocabEntry = {
        es: vocab.es,
        de: vocab.de,
        category,
        timestamp: now,
        saved: false
      };

      const docRef = await addDoc(vocabularyCollection, vocabEntry);
      importedEntries.push({ ...vocabEntry, id: docRef.id });
    }

    return importedEntries;
  } catch (error) {
    console.error('Fehler beim Importieren der Vokabeln:', error);
    throw error;
  }
};

/**
 * Lädt alle Vokabeln aus Firestore
 */
export const loadVocabulary = async (): Promise<VocabularyEntry[]> => {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const vocabularyCollection = getUserVocabularyCollection();
    const snapshot = await getDocs(vocabularyCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VocabularyEntry));
  } catch (error) {
    console.error('Fehler beim Laden der Vokabeln:', error);
    return [];
  }
};

/**
 * Lädt Vokabeln nach Kategorie
 */
export const loadVocabularyByCategory = async (category: string): Promise<VocabularyEntry[]> => {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    const vocabularyCollection = getUserVocabularyCollection();
    const q = query(vocabularyCollection, where('category', '==', category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VocabularyEntry));
  } catch (error) {
    console.error('Fehler beim Laden der Vokabeln nach Kategorie:', error);
    return [];
  }
};

/**
 * Gibt alle verfügbaren Kategorien zurück
 */
export const getVocabularyCategories = async (): Promise<string[]> => {
  const vocabulary = await loadVocabulary();
  const categories = new Set(vocabulary.map(v => v.category));
  return Array.from(categories).sort();
};

/**
 * Konvertiert eine Vokabel zu einer Flashcard und speichert sie
 */
export const importVocabAsFlashcard = async (vocabId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const vocabulary = await loadVocabulary();
    const vocab = vocabulary.find(v => v.id === vocabId);
    if (!vocab) return false;

    // Erstelle Flashcard
    const flashcard: Flashcard = {
      es: vocab.es,
      de: vocab.de
    };

    // Speichere Flashcard mit Kategorie
    const savedCard = await saveFlashcard(flashcard, vocab.category);
    
    if (savedCard) {
      // Markiere Vokabel als gespeichert
      const vocabDocRef = doc(db, 'users', user.uid, COLLECTION_NAME, vocabId);
      await updateDoc(vocabDocRef, { saved: true });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Fehler beim Konvertieren der Vokabel:', error);
    return false;
  }
};

/**
 * Importiert mehrere Vokabeln als Flashcards
 */
export const importMultipleVocabAsFlashcards = async (
  vocabIds: string[]
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const id of vocabIds) {
    const result = await importVocabAsFlashcard(id);
    if (result) success++;
    else failed++;
  }

  return { success, failed };
};

/**
 * Importiert alle Vokabeln einer Kategorie als Flashcards
 */
export const importCategoryAsFlashcards = async (category: string): Promise<{ success: number; failed: number }> => {
  const vocabList = await loadVocabularyByCategory(category);
  const vocabIds = vocabList.map(v => v.id);
  return importMultipleVocabAsFlashcards(vocabIds);
};

/**
 * Löscht eine Vokabel
 */
export const deleteVocabulary = async (vocabId: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const docRef = doc(db, 'users', user.uid, COLLECTION_NAME, vocabId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Fehler beim Löschen der Vokabel:', error);
  }
};

/**
 * Real-time subscription zu Vokabeln
 */
export const subscribeToVocabulary = (
  onUpdate: (vocabulary: VocabularyEntry[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn('No authenticated user for vocabulary subscription');
      return () => {};
    }

    const vocabularyCollection = getUserVocabularyCollection();
    
    const unsubscribe = onSnapshot(
      vocabularyCollection,
      (snapshot) => {
        const vocabulary = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as VocabularyEntry));
        onUpdate(vocabulary);
      },
      (error) => {
        console.error('Error in vocabulary subscription:', error);
        if (onError) onError(error as Error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up vocabulary subscription:', error);
    return () => {};
  }
};

/**
 * Vordefinierte Vokabellisten für schnellen Import
 */
export const PREDEFINED_VOCAB_LISTS = {
  'Strand & Küste': [
    { es: 'la playa', de: 'der Strand' },
    { es: 'la costa', de: 'die Küste' },
    { es: 'las dunas de arena', de: 'die Sanddünen' },
    { es: 'la hierba', de: 'das Gras' },
    { es: 'la valla de madera', de: 'der Holzzaun' },
    { es: 'el alambre de espino', de: 'der Stacheldraht' },
    { es: 'el mar Cantábrico', de: 'das Kantabrische Meer' },
    { es: 'el océano Atlántico', de: 'der Atlantische Ozean' },
    { es: 'la ola', de: 'die Welle' },
    { es: 'la arena', de: 'der Sand' },
    { es: 'el horizonte', de: 'der Horizont' },
    { es: 'el cielo', de: 'der Himmel' },
    { es: 'las nubes', de: 'die Wolken' }
  ],
  'Natur & Landschaft': [
    { es: 'el paisaje', de: 'die Landschaft' },
    { es: 'la naturaleza', de: 'die Natur' },
    { es: 'el campo', de: 'das Feld' },
    { es: 'la montaña', de: 'der Berg' },
    { es: 'el bosque', de: 'der Wald' },
    { es: 'el río', de: 'der Fluss' },
    { es: 'el lago', de: 'der See' },
    { es: 'la piedra', de: 'der Stein' },
    { es: 'la flor', de: 'die Blume' },
    { es: 'el árbol', de: 'der Baum' }
  ],
  'Wetter': [
    { es: 'el tiempo', de: 'das Wetter' },
    { es: 'el sol', de: 'die Sonne' },
    { es: 'la lluvia', de: 'der Regen' },
    { es: 'el viento', de: 'der Wind' },
    { es: 'la tormenta', de: 'der Sturm' },
    { es: 'la nieve', de: 'der Schnee' },
    { es: 'la niebla', de: 'der Nebel' },
    { es: 'despejado', de: 'klar/heiter' },
    { es: 'nublado', de: 'bewölkt' }
  ]
};
