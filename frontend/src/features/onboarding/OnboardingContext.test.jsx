import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { OnboardingProvider, useOnboarding } from './OnboardingContext.jsx';
import { useAuth } from '../../core/auth/index.js';

// Mock useAuth
vi.mock('../../core/auth/index.js', () => ({
  useAuth: vi.fn(),
}));

function TestComponent() {
  const {
    isTourActive,
    currentStepIndex,
    currentStep,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
    restartTour,
  } = useOnboarding();

  return (
    <div>
      <div data-testid="is-active">{isTourActive.toString()}</div>
      <div data-testid="step-index">{currentStepIndex}</div>
      <div data-testid="step-title">{currentStep ? currentStep.title : 'No active step'}</div>
      <button data-testid="btn-next" onClick={nextStep}>Next</button>
      <button data-testid="btn-prev" onClick={prevStep}>Back</button>
      <button data-testid="btn-skip" onClick={skipTour}>Skip</button>
      <button data-testid="btn-finish" onClick={finishTour}>Finish</button>
      <button data-testid="btn-restart" onClick={restartTour}>Restart</button>
    </div>
  );
}

describe('OnboardingContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not start the tour if no user is authenticated', () => {
    useAuth.mockReturnValue({ user: null });

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId('is-active').textContent).toBe('false');
  });

  it('starts the tour automatically for a first-time user after login', () => {
    useAuth.mockReturnValue({ user: { name: 'John Doe' } });

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    // Default state before timer should be inactive
    expect(screen.getByTestId('is-active').textContent).toBe('false');

    // Run timeout timer (800ms)
    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId('is-active').textContent).toBe('true');
    expect(screen.getByTestId('step-index').textContent).toBe('0');
  });

  it('steps through the tour', () => {
    useAuth.mockReturnValue({ user: { name: 'John Doe' } });

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId('step-index').textContent).toBe('0');

    // Next step
    act(() => {
      screen.getByTestId('btn-next').click();
    });
    expect(screen.getByTestId('step-index').textContent).toBe('1');

    // Prev step
    act(() => {
      screen.getByTestId('btn-prev').click();
    });
    expect(screen.getByTestId('step-index').textContent).toBe('0');
  });

  it('sets localStorage and deactivates when skipped', () => {
    useAuth.mockReturnValue({ user: { name: 'John Doe' } });

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId('is-active').textContent).toBe('true');

    act(() => {
      screen.getByTestId('btn-skip').click();
    });

    expect(screen.getByTestId('is-active').textContent).toBe('false');
    expect(localStorage.getItem('zariya_tour_completed_john_doe')).toBe('skipped');
  });

  it('sets localStorage and deactivates when finished', () => {
    useAuth.mockReturnValue({ user: { name: 'John Doe' } });

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByTestId('is-active').textContent).toBe('true');

    act(() => {
      screen.getByTestId('btn-finish').click();
    });

    expect(screen.getByTestId('is-active').textContent).toBe('false');
    expect(localStorage.getItem('zariya_tour_completed_john_doe')).toBe('completed');
  });

  it('restarts the tour when requested', () => {
    useAuth.mockReturnValue({ user: { name: 'John Doe' } });
    localStorage.setItem('zariya_tour_completed_john_doe', 'completed');

    render(
      <OnboardingProvider>
        <TestComponent />
      </OnboardingProvider>
    );

    act(() => {
      vi.runAllTimers();
    });

    // Should not auto-start because already completed
    expect(screen.getByTestId('is-active').textContent).toBe('false');

    // Trigger manual restart
    act(() => {
      screen.getByTestId('btn-restart').click();
    });

    expect(screen.getByTestId('is-active').textContent).toBe('true');
    expect(screen.getByTestId('step-index').textContent).toBe('0');
    expect(localStorage.getItem('zariya_tour_completed_john_doe')).toBeNull();
  });
});
