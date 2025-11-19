/**
 * Tutorial System - Main Export
 * Central export file for all tutorial components and utilities
 */

// Context
export { TutorialProvider, useTutorial } from './context/TutorialContext';

// Components
export { default as TutorialOverlay } from './components/TutorialOverlay';

// Services
export { tutorialService } from './services/tutorialService';

// Types
export type {
  TutorialStepId,
  TooltipPosition,
  TutorialAction,
  TutorialStep,
  TutorialState,
  TutorialContextValue,
  SpotlightConfig,
  TooltipConfig,
  TutorialMockData,
} from './types';

// Data
export { tutorialSteps, getStepById, getTotalSteps } from './data/tutorialSteps';
