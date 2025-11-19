/**
 * Tutorial System - Type Definitions
 * Professional TypeScript types for the interactive app tutorial
 */

export type TutorialStepId = 
  | 'welcome'
  | 'analyzer-tab'
  | 'diary-tab'
  | 'chat-tab'
  | 'flashcards-tab'
  | 'leitner-system'
  | 'tutorial-complete';

export type TooltipPosition = 
  | 'top' 
  | 'bottom' 
  | 'left' 
  | 'right' 
  | 'top-left' 
  | 'top-right' 
  | 'bottom-left' 
  | 'bottom-right'
  | 'center';

export type TutorialAction = 
  | 'next' 
  | 'prev' 
  | 'skip' 
  | 'complete'
  | 'auto-advance';

export interface TutorialStep {
  id: TutorialStepId;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector for spotlight element
  tooltipPosition: TooltipPosition;
  spotlightPadding?: number; // Padding around spotlighted element (default: 8px)
  allowInteraction?: boolean; // Allow user to interact with highlighted element
  autoAdvanceDelay?: number; // Auto-advance after X ms (0 = no auto-advance)
  simulateAction?: () => Promise<void>; // Optional simulated action (e.g., fake API call)
  beforeStep?: () => Promise<void>; // Execute before showing step
  afterStep?: () => Promise<void>; // Execute after leaving step
  showProgress?: boolean; // Show step indicator (default: true)
}

export interface TutorialState {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TutorialStep | null;
  totalSteps: number;
  hasCompletedTutorial: boolean;
  isSkipped: boolean;
}

export interface TutorialContextValue {
  state: TutorialState;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  restartTutorial: () => void;
  goToStep: (stepIndex: number) => void;
}

export interface SpotlightConfig {
  element: HTMLElement;
  padding: number;
  borderRadius: number;
}

export interface TooltipConfig {
  title: string;
  description: string;
  position: TooltipPosition;
  stepIndex: number;
  totalSteps: number;
  showProgress: boolean;
}

export interface TutorialMockData {
  mockImageAnalysis: {
    description_de: string;
    description_es: string;
    vocab: Array<{ es: string; de: string }>;
    quiz: Array<{ question: string; options: string[]; correct: string }>;
    labels: string[];
  };
  mockDiaryEntry: {
    id: string;
    timestamp: string;
    imagePreview: string;
    location: string;
    analysisResult: any;
  };
  mockFlashcards: Array<{
    id: string;
    es: string;
    de: string;
    box: number;
    timestamp: string;
    category?: string;
  }>;
}
