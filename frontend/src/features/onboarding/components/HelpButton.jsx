import { IconButton, Tooltip } from '@mui/material';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import { useOnboarding } from '../OnboardingContext.jsx';

export function HelpButton() {
  const { restartTour } = useOnboarding();

  return (
    <Tooltip title="Help & Tutorial">
      <IconButton
        onClick={restartTour}
        size="small"
        aria-label="Restart onboarding tutorial"
        sx={{ color: 'text.secondary' }}
      >
        <HelpOutlineRoundedIcon sx={{ fontSize: 19 }} />
      </IconButton>
    </Tooltip>
  );
}
