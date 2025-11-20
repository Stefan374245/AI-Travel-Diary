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
  box: number;
  lastReviewed: string | null;
  nextReview: string;
  reviewCount: number;
  entryId?: string;
  imageUrl?: string;
  location?: string;
}

export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LanguageLevelInfo {
  level: LanguageLevel;
  label: string;
  description: string;
}

export interface ChatResponse {
  reply: string;
  suggested_flashcards?: Flashcard[];
  grammar_tip?: string;
  difficulty_feedback?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  response?: ChatResponse;
}

export interface ChatConfig {
  languageLevel: LanguageLevel;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SavedEntry {
  id: string;
  timestamp: string;
  imagePreview: string;
  location: string;
  coordinates?: Coordinates; // Optional: GPS-Koordinaten
  analysisResult: ImageAnalysisResult;
}