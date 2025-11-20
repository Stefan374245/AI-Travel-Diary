/**
 * Tutorial Context - Central State Management
 * React Context for managing tutorial state across the app
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { TutorialContextValue, TutorialState, TutorialStep } from '../types';
import { tutorialSteps } from '../data/tutorialSteps';
import { tutorialService } from '../services/tutorialService';

const TutorialContext = createContext<TutorialContextValue | undefined>(undefined);

interface TutorialProviderProps {
  children: ReactNode;
  autoStart?: boolean; // Auto-start tutorial if not seen before
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ 
  children, 
  autoStart = true 
}) => {
  const [state, setState] = useState<TutorialState>({
    isActive: false,
    currentStepIndex: 0,
    currentStep: null,
    totalSteps: tutorialSteps.length,
    hasCompletedTutorial: tutorialService.hasSeenTutorial(),
    isSkipped: false,
  });

  // Auto-start tutorial on mount if not seen before
  useEffect(() => {
    if (autoStart && !tutorialService.hasSeenTutorial()) {
      // Small delay to let the app render first
      const timer = setTimeout(() => {
        startTutorial();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  const startTutorial = useCallback(async () => {
    // Execute beforeStep of first step
    const firstStep = tutorialSteps[0];
    if (firstStep?.beforeStep) {
      try {
        await firstStep.beforeStep();
      } catch (error) {
        console.error('Error in beforeStep:', error);
      }
    }

    setState({
      isActive: true,
      currentStepIndex: 0,
      currentStep: tutorialSteps[0],
      totalSteps: tutorialSteps.length,
      hasCompletedTutorial: false,
      isSkipped: false,
    });
  }, []);

  const nextStep = useCallback(async () => {
    // Execute afterStep of current step
    const currentStepData = tutorialSteps[state.currentStepIndex];
    if (currentStepData?.afterStep) {
      try {
        await currentStepData.afterStep();
      } catch (error) {
        console.error('Error in afterStep:', error);
      }
    }

    const nextIndex = state.currentStepIndex + 1;
    
    if (nextIndex >= tutorialSteps.length) {
      // Tutorial complete
      tutorialService.markAsCompleted();
      setState(prev => ({
        ...prev,
        isActive: false,
        hasCompletedTutorial: true,
      }));
      return;
    }

    // Execute beforeStep of next step
    const nextStepData = tutorialSteps[nextIndex];
    if (nextStepData?.beforeStep) {
      try {
        await nextStepData.beforeStep();
      } catch (error) {
        console.error('Error in beforeStep:', error);
      }
    }

    setState(prev => ({
      ...prev,
      currentStepIndex: nextIndex,
      currentStep: tutorialSteps[nextIndex],
    }));
  }, [state.currentStepIndex]);

  const prevStep = useCallback(async () => {
    const prevIndex = Math.max(0, state.currentStepIndex - 1);
    
    // Execute beforeStep of previous step
    const prevStepData = tutorialSteps[prevIndex];
    if (prevStepData?.beforeStep) {
      try {
        await prevStepData.beforeStep();
      } catch (error) {
        console.error('Error in beforeStep:', error);
      }
    }
    
    setState(prev => ({
      ...prev,
      currentStepIndex: prevIndex,
      currentStep: tutorialSteps[prevIndex],
    }));
  }, [state.currentStepIndex]);

  const skipTutorial = useCallback(() => {
    tutorialService.markAsSkipped();
    setState(prev => ({
      ...prev,
      isActive: false,
      isSkipped: true,
    }));
  }, []);

  const completeTutorial = useCallback(() => {
    tutorialService.markAsCompleted();
    setState(prev => ({
      ...prev,
      isActive: false,
      hasCompletedTutorial: true,
    }));
  }, []);

  const restartTutorial = useCallback(() => {
    tutorialService.resetTutorial();
    startTutorial();
  }, [startTutorial]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < tutorialSteps.length) {
      setState(prev => ({
        ...prev,
        currentStepIndex: stepIndex,
        currentStep: tutorialSteps[stepIndex],
      }));
    }
  }, []);

  const value: TutorialContextValue = {
    state,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
    restartTutorial,
    goToStep,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

/**
 * Hook to access tutorial context
 */
export const useTutorial = (): TutorialContextValue => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider');
  }
  return context;
};
