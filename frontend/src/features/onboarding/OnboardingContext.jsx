import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../core/auth/index.js';
import { onboardingSteps } from './onboardingSteps.js';

const OnboardingContext = createContext(null);

export function OnboardingProvider({ children }) {
  const { user } = useAuth();
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Local storage key helper
  const getStorageKey = useCallback(() => {
    return user?.name ? `zariya_tour_completed_${user.name.replace(/\s+/g, '_').toLowerCase()}` : null;
  }, [user]);

  // Check if tour should auto-start
  useEffect(() => {
    if (user) {
      const key = getStorageKey();
      if (key) {
        const completed = localStorage.getItem(key);
        if (!completed) {
          // Add a slight delay to allow page rendering before showing the tour
          const timer = setTimeout(() => {
            setIsTourActive(true);
            setCurrentStepIndex(0);
          }, 800);
          return () => clearTimeout(timer);
        }
      }
    } else {
      const timer = setTimeout(() => {
        setIsTourActive(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user, getStorageKey]);

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsTourActive(true);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, onboardingSteps.length - 1));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    const key = getStorageKey();
    if (key) {
      localStorage.setItem(key, 'skipped');
    }
  }, [getStorageKey]);

  const finishTour = useCallback(() => {
    setIsTourActive(false);
    const key = getStorageKey();
    if (key) {
      localStorage.setItem(key, 'completed');
    }
  }, [getStorageKey]);

  const restartTour = useCallback(() => {
    const key = getStorageKey();
    if (key) {
      localStorage.removeItem(key);
    }
    setCurrentStepIndex(0);
    setIsTourActive(true);
  }, [getStorageKey]);

  return (
    <OnboardingContext.Provider
      value={{
        isTourActive,
        currentStepIndex,
        steps: onboardingSteps,
        currentStep: onboardingSteps[currentStepIndex],
        startTour,
        nextStep,
        prevStep,
        skipTour,
        finishTour,
        restartTour,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
