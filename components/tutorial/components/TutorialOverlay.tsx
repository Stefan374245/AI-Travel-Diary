/**
 * TutorialOverlay Component
 * Main tutorial UI with spotlight effect and tooltips
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useTutorial } from '../context/TutorialContext';
import { TooltipPosition } from '../types';
import '../animations/tutorialAnimations.css';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: number;
}

const TutorialOverlay: React.FC = () => {
  const { state, nextStep, prevStep, skipTutorial } = useTutorial();
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);

  // Calculate spotlight and tooltip positions
  // Separate function for just updating positions without scrolling
  const updatePositionsOnly = useCallback(() => {
    if (!state.isActive || !state.currentStep) {
      return;
    }

    const { targetSelector, tooltipPosition: tooltipPos, spotlightPadding = 8 } = state.currentStep;

    if (!targetSelector) {
      return;
    }

    const element = document.querySelector(targetSelector) as HTMLElement;
    if (!element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    
    // For navbar elements, use viewport coordinates directly (no scroll offset)
    // This keeps the spotlight fixed to the navbar position
    const spotlight: SpotlightRect = {
      top: rect.top - spotlightPadding,
      left: rect.left - spotlightPadding,
      width: rect.width + spotlightPadding * 2,
      height: rect.height + spotlightPadding * 2,
      borderRadius: 12,
    };
    setSpotlightRect(spotlight);

    const tooltip = calculateTooltipPosition(rect, tooltipPos, 0, 0);
    setTooltipPosition(tooltip);
  }, [state.isActive, state.currentStep]);

  const updatePositions = useCallback(() => {
    if (!state.isActive || !state.currentStep) {
      setSpotlightRect(null);
      setTooltipPosition(null);
      return;
    }

    const { targetSelector, tooltipPosition: tooltipPos, spotlightPadding = 8 } = state.currentStep;

    if (!targetSelector) {
      // No target = center tooltip
      setSpotlightRect(null);
      setTooltipPosition(null);
      return;
    }

    const element = document.querySelector(targetSelector) as HTMLElement;
    if (!element) {
      console.warn(`Tutorial: Element not found for selector "${targetSelector}"`);
      setSpotlightRect(null);
      setTooltipPosition(null);
      return;
    }

    // For navbar tabs: Calculate position immediately for smooth transition
    updatePositionsOnly();
  }, [state.isActive, state.currentStep, updatePositionsOnly]);

  useEffect(() => {
    // Immediate positioning for navbar elements (no delay needed)
    updatePositions();
    
    // Recalculate on resize only
    window.addEventListener('resize', updatePositionsOnly);
    
    return () => {
      window.removeEventListener('resize', updatePositionsOnly);
    };
  }, [updatePositions, updatePositionsOnly]);

  // Auto-advance if configured
  useEffect(() => {
    if (!state.isActive || !state.currentStep) return;

    const { autoAdvanceDelay } = state.currentStep;
    if (autoAdvanceDelay && autoAdvanceDelay > 0) {
      const timer = setTimeout(() => {
        nextStep();
      }, autoAdvanceDelay);
      
      return () => clearTimeout(timer);
    }
  }, [state.isActive, state.currentStep, nextStep]);

  if (!state.isActive || !state.currentStep) {
    return null;
  }

  const { title, description, tooltipPosition: tooltipPos, targetSelector, showProgress = true } = state.currentStep;
  const { currentStepIndex, totalSteps } = state;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Don't render until position is calculated (prevents jump from top-left)
  // Exception: center tooltips don't need target element
  if (targetSelector && !spotlightRect && tooltipPos !== 'center') {
    return null;
  }

  return (
    <div className="tutorial-overlay tutorial-overlay-active">
      {/* Backdrop with SVG cutout for spotlight */}
      <svg
        className="tutorial-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx={spotlightRect.borderRadius}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* Spotlight Border */}
      {spotlightRect && (
        <div
          className="tutorial-spotlight"
          style={{
            position: 'fixed',
            top: `${spotlightRect.top}px`,
            left: `${spotlightRect.left}px`,
            width: `${spotlightRect.width}px`,
            height: `${spotlightRect.height}px`,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={`tutorial-tooltip tutorial-tooltip-${tooltipPos}`}
        style={
          tooltipPosition
            ? { top: `${tooltipPosition.top}px`, left: `${tooltipPosition.left}px` }
            : tooltipPos === 'center'
            ? { position: 'fixed' }
            : undefined
        }
      >
        {/* Progress Bar */}
        {showProgress && (
          <div className="tutorial-progress">
            <div
              className="tutorial-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>

        {/* Step Indicator */}
        {showProgress && (
          <div className="text-sm text-slate-500 mb-4 text-center">
            Schritt {currentStepIndex + 1} von {totalSteps}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={skipTutorial}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Überspringen
          </button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={prevStep}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
              >
                Zurück
              </button>
            )}
            <button
              onClick={nextStep}
              className="px-6 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
            >
              {isLastStep ? 'Fertig' : 'Weiter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Calculate tooltip position based on target element and desired position
 */
const calculateTooltipPosition = (
  targetRect: DOMRect,
  position: TooltipPosition,
  scrollX: number,
  scrollY: number
): { top: number; left: number } => {
  const tooltipWidth = 400; // max-width from CSS
  const tooltipHeight = 200; // estimated
  const gap = 20; // gap between tooltip and target

  let top = 0;
  let left = 0;

  switch (position) {
    case 'top':
      top = targetRect.top + scrollY - tooltipHeight - gap;
      left = targetRect.left + scrollX + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case 'bottom':
      top = targetRect.bottom + scrollY + gap;
      left = targetRect.left + scrollX + targetRect.width / 2 - tooltipWidth / 2;
      break;
    case 'left':
      top = targetRect.top + scrollY + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.left + scrollX - tooltipWidth - gap;
      break;
    case 'right':
      top = targetRect.top + scrollY + targetRect.height / 2 - tooltipHeight / 2;
      left = targetRect.right + scrollX + gap;
      break;
    case 'top-left':
      top = targetRect.top + scrollY - tooltipHeight - gap;
      left = targetRect.left + scrollX;
      break;
    case 'top-right':
      top = targetRect.top + scrollY - tooltipHeight - gap;
      left = targetRect.right + scrollX - tooltipWidth;
      break;
    case 'bottom-left':
      top = targetRect.bottom + scrollY + gap;
      left = targetRect.left + scrollX;
      break;
    case 'bottom-right':
      top = targetRect.bottom + scrollY + gap;
      left = targetRect.right + scrollX - tooltipWidth;
      break;
    default:
      // Center (handled by CSS)
      return { top: 0, left: 0 };
  }

  // Keep tooltip in viewport with extra padding
  const maxLeft = window.innerWidth - tooltipWidth - 20;
  const maxTop = window.innerHeight + scrollY - tooltipHeight - 100; // Extra padding at bottom
  
  left = Math.max(20, Math.min(left, maxLeft));
  top = Math.max(scrollY + 80, Math.min(top, maxTop)); // Extra padding at top

  return { top, left };
};

export default TutorialOverlay;
