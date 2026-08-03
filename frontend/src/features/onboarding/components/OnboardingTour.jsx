import { useEffect, useState, useRef, useCallback } from 'react';
import { Box, Button, Card, CardContent, MobileStepper, Typography, useTheme } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { useOnboarding } from '../OnboardingContext.jsx';

export function OnboardingTour() {
  const theme = useTheme();
  const location = useLocation();
  const {
    isTourActive,
    currentStepIndex,
    steps,
    currentStep,
    nextStep,
    prevStep,
    skipTour,
    finishTour,
  } = useOnboarding();

  const [targetRect, setTargetRect] = useState(null);
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const cardRef = useRef(null);
  const [cardSize, setCardSize] = useState({ width: 320, height: 180 });

  // Update highlighted element coordinates
  const updateCoordinates = useCallback(() => {
    if (!currentStep || !currentStep.target) {
      setTargetRect(null);
      return;
    }
    const element = document.querySelector(currentStep.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      // Only update if dimensions actually changed (prevent loops)
      setTargetRect({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      });
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  // Handle window resizing and scroll
  useEffect(() => {
    if (!isTourActive) return;

    // Run coordinates update asynchronously to prevent cascading render warnings
    const initialTimer = setTimeout(updateCoordinates, 0);

    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
      updateCoordinates();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', updateCoordinates, true);

    // Set up a MutationObserver to watch for dynamically loaded content
    const observer = new MutationObserver(updateCoordinates);
    observer.observe(document.body, { childList: true, subtree: true });

    // Fallback interval to capture rendering changes
    const interval = setInterval(updateCoordinates, 300);

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', updateCoordinates, true);
      observer.disconnect();
      clearInterval(interval);
    };
  }, [isTourActive, updateCoordinates, location.pathname]);

  // Monitor card dimensions to ensure accurate placement calculations
  useEffect(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCardSize({ width: rect.width, height: rect.height });
    }
  }, [currentStepIndex, isTourActive]);

  if (!isTourActive || !currentStep) return null;

  const pad = 6; // Spotlight padding
  const rx = 8;  // Spotlight border-radius
  const W = viewportSize.width;
  const H = viewportSize.height;

  let path;
  if (targetRect) {
    const x = targetRect.left - pad;
    const y = targetRect.top - pad;
    const w = targetRect.width + pad * 2;
    const h = targetRect.height + pad * 2;

    // Viewport outer path + inner rounded rectangle cutout path (even-odd fill rule)
    path = `M 0,0 
            L ${W},0 
            L ${W},${H} 
            L 0,${H} 
            Z 
            M ${x},${y + rx} 
            a ${rx},${rx} 0 0,1 ${rx},-${rx} 
            l ${w - 2 * rx},0 
            a ${rx},${rx} 0 0,1 ${rx},${rx} 
            l 0,${h - 2 * rx} 
            a ${rx},${rx} 0 0,1 -${rx},${rx} 
            l -${w - 2 * rx},0 
            a ${rx},${rx} 0 0,1 -${rx},-${rx} 
            Z`;
  } else {
    // Full screen overlay without cutout if target is null (welcome modal state)
    path = `M 0,0 L ${W},0 L ${W},${H} L 0,${H} Z`;
  }

  // Calculate Popover Position
  let tooltipStyle = {
    position: 'fixed',
    zIndex: 10000,
    width: 340,
    maxWidth: '90vw',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  if (!targetRect) {
    // Center of screen
    tooltipStyle.left = '50%';
    tooltipStyle.top = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  } else {
    const gap = 16;
    const cardW = cardSize.width;
    const cardH = cardSize.height;

    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    let computedLeft;
    let computedTop;

    switch (currentStep.placement) {
      case 'right':
        computedLeft = targetRect.right + gap;
        computedTop = targetY - cardH / 2;
        break;
      case 'left':
        computedLeft = targetRect.left - cardW - gap;
        computedTop = targetY - cardH / 2;
        break;
      case 'top':
        computedLeft = targetX - cardW / 2;
        computedTop = targetRect.top - cardH - gap;
        break;
      case 'bottom':
      default:
        computedLeft = targetX - cardW / 2;
        computedTop = targetRect.bottom + gap;
        break;
    }

    // Keep popover card within viewport safety boundaries
    const padding = 16;
    computedLeft = Math.max(padding, Math.min(computedLeft, W - cardW - padding));
    computedTop = Math.max(padding, Math.min(computedTop, H - cardH - padding));

    tooltipStyle.left = computedLeft;
    tooltipStyle.top = computedTop;
  }

  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
      {/* Semi-transparent Backdrop Overlay with SVG Cutout */}
      <svg
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
        }}
      >
        <path
          d={path}
          fill={theme.palette.mode === 'dark' ? 'rgba(10, 9, 7, 0.72)' : 'rgba(35, 36, 31, 0.6)'}
          fillRule="evenodd"
          style={{ transition: 'd 0.25s ease-in-out' }}
        />
      </svg>

      {/* Pulsing indicator on the spotlight element */}
      {targetRect && (
        <Box
          className="tour-pulse-indicator"
          sx={{
            position: 'fixed',
            left: targetRect.left - pad,
            top: targetRect.top - pad,
            width: targetRect.width + pad * 2,
            height: targetRect.height + pad * 2,
            borderRadius: `${rx}px`,
            border: `2px solid ${theme.palette.primary.main}`,
            boxShadow: `0 0 0 4px ${theme.palette.primary.light}33`,
            pointerEvents: 'none',
            zIndex: 9999,
            animation: 'tourPulse 1.8s infinite ease-in-out',
            '@keyframes tourPulse': {
              '0%': { transform: 'scale(1)', opacity: 0.9, boxShadow: `0 0 0 0px ${theme.palette.primary.main}66` },
              '70%': { transform: 'scale(1.01)', opacity: 0.4, boxShadow: `0 0 0 8px ${theme.palette.primary.main}00` },
              '100%': { transform: 'scale(1)', opacity: 0, boxShadow: `0 0 0 0px ${theme.palette.primary.main}00` }
            }
          }}
        />
      )}

      {/* Floating Tutorial Card */}
      <Card
        ref={cardRef}
        elevation={12}
        sx={{
          ...tooltipStyle,
          pointerEvents: 'auto',
          borderRadius: 3,
          backgroundColor: theme.palette.background.card || theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          boxShadow: theme.shadows[16],
          overflow: 'visible',
          '&::before': {
            // Elegant gradient bar at the top of the card
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || '#D9B35E'} 100%)`,
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
          }
        }}
      >
        <CardContent sx={{ pt: 2.5, pb: 1.5, px: 2.5 }}>
          {/* Header Progress text */}
          <Typography
            variant="caption"
            sx={{
              letterSpacing: '.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
              color: 'text.secondary',
              display: 'block',
              fontSize: 10,
              mb: 0.75,
            }}
          >
            Getting Started · Step {currentStepIndex + 1} of {steps.length}
          </Typography>

          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 600,
              mb: 1.25,
              color: 'text.primary',
              fontSize: 17,
              letterSpacing: '-0.01em',
            }}
          >
            {currentStep.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.5,
              fontSize: 13.5,
              mb: 2.5,
            }}
          >
            {currentStep.description}
          </Typography>

          {/* Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
            <Button
              size="small"
              color="inherit"
              onClick={skipTour}
              sx={{
                fontSize: 11,
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'none',
                minWidth: 'auto',
                p: 0.5,
                '&:hover': { color: 'error.main', backgroundColor: 'transparent' },
              }}
            >
              Skip Tour
            </Button>

            <MobileStepper
              variant="dots"
              steps={steps.length}
              activeStep={currentStepIndex}
              position="static"
              sx={{
                flexGrow: 1,
                justifyContent: 'center',
                backgroundColor: 'transparent',
                p: 0,
                '& .MuiMobileStepper-dot': {
                  width: 6,
                  height: 6,
                  mx: 0.5,
                },
                '& .MuiMobileStepper-dotActive': {
                  backgroundColor: 'primary.main',
                }
              }}
            />

            <Box sx={{ display: 'flex', gap: 1 }}>
              {currentStepIndex > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={prevStep}
                  sx={{
                    fontSize: 11.5,
                    px: 1.5,
                    py: 0.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 1.5,
                  }}
                >
                  Back
                </Button>
              )}
              <Button
                size="small"
                variant="contained"
                onClick={isLastStep ? finishTour : nextStep}
                sx={{
                  fontSize: 11.5,
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 1.5,
                }}
              >
                {isLastStep ? 'Finish' : 'Next'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
