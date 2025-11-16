export interface VocabItem {
  es: string;
  de: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: string;
}

export interface ImageAnalysisResult {
  description_de: string;
  description_es: string;
  vocab: VocabItem[];
  quiz: QuizQuestion[];
  labels: string[];
}

export interface Flashcard {
  es: string;
  de: string;
}

export interface SavedFlashcard extends Flashcard {
  id: string;
  timestamp: string;
  category?: string;
  box: number; // Leitner Box 1-5 (1 = neu/schwer, 5 = gut gelernt)
  lastReviewed: string | null; // ISO timestamp der letzten Wiederholung
  nextReview: string; // ISO timestamp wann Karte wieder fällig ist
  reviewCount: number; // Wie oft richtig beantwortet
  entryId?: string; // Verknüpfung zu Reiseeintrag
  imageUrl?: string; // Bild vom Reiseeintrag
  location?: string; // Ort vom Reiseeintrag
}

export interface ChatResponse {
  reply: string;
  suggested_flashcards?: Flashcard[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  response?: ChatResponse;
}

export interface SavedEntry {
  id: string;
  timestamp: string;
  imagePreview: string;
  location: string;
  analysisResult: ImageAnalysisResult;
}