import { Box, Stack, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import PauseIcon from '@mui/icons-material/Pause';
import { formatDate } from '../../../lib/format/date.js';

/**
 * Horizontal progress through the funding lifecycle:
 *   Terms set → Agreement recorded → Approved → Completed
 * "On hold" isn't a step of its own — it marks the Approved step as paused.
 */
const STEPS = [
  { key: 'terms', label: 'Terms set' },
  { key: 'agreement', label: 'Agreement recorded' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
];

/** How far along a stage key is (index of the last finished step). */
const REACHED = { terms: 0, pending: 1, approved: 2, onhold: 2, completed: 3 };

export function LifecycleTracker({ stage, profile, grant }) {
  const reached = REACHED[stage] ?? 0;
  const paused = stage === 'onhold';

  const captions = {
    terms: profile?.profileCode || null,
    agreement: grant ? grant.grantCode : 'Next step',
    approved: grant?.isApproved === 1 && grant.approvalDate ? formatDate(grant.approvalDate) : paused ? 'On hold' : null,
    completed: grant?.endDate ? `Ends ${formatDate(grant.endDate)}` : null,
  };

  return (
    <Stack direction="row" sx={{ alignItems: 'flex-start', overflowX: 'auto', py: 0.5 }}>
      {STEPS.map((step, index) => {
        const done = index <= reached;
        const isPaused = paused && index === reached;
        const isNext = index === reached + 1;
        const color = isPaused ? 'var(--warn)' : done ? 'var(--ok)' : isNext ? 'var(--info)' : 'var(--line)';
        return (
          <Stack key={step.key} direction="row" sx={{ flex: 1, minWidth: 130, alignItems: 'flex-start' }}>
            <Stack sx={{ alignItems: 'center', minWidth: 0, flex: 'none', width: 120 }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  border: '2px solid',
                  borderColor: color,
                  bgcolor: done ? color : 'transparent',
                  color: done ? 'var(--card)' : color,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {isPaused ? (
                  <PauseIcon sx={{ fontSize: 15 }} />
                ) : done ? (
                  <CheckIcon sx={{ fontSize: 15 }} />
                ) : (
                  index + 1
                )}
              </Box>
              <Typography
                variant="body2"
                sx={{ mt: 0.75, fontWeight: done || isNext ? 600 : 400, color: done || isNext ? 'text.primary' : 'text.disabled', textAlign: 'center', fontSize: 13 }}
              >
                {step.label}
              </Typography>
              {captions[step.key] ? (
                <Typography
                  variant="caption"
                  sx={{ color: isPaused ? 'var(--warn)' : isNext ? 'var(--info)' : 'text.secondary', textAlign: 'center', fontFamily: step.key === 'terms' || (step.key === 'agreement' && grant) ? 'monospace' : undefined }}
                >
                  {captions[step.key]}
                </Typography>
              ) : null}
            </Stack>
            {index < STEPS.length - 1 ? (
              <Box sx={{ flex: 1, height: 2, mt: '12px', minWidth: 12, bgcolor: index < reached ? 'var(--ok)' : 'var(--line)' }} />
            ) : null}
          </Stack>
        );
      })}
    </Stack>
  );
}
