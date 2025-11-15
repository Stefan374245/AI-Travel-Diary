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