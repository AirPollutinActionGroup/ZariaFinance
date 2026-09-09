import { Box } from '@mui/material';
import { PROGRAMME_STATUSES, PROGRAMME_STATUS_TONE } from '../constants.js';

// Same tone tokens StatusChip renders elsewhere in the app, so this bar reads
// as the same visual language as every other status pill.
const STATUS_TONE_STYLE = {
  neutral: { bg: 'var(--card2)', fg: 'var(--muted)' },
  success: { bg: 'var(--ok-bg)', fg: 'var(--ok)' },
  warning: { bg: 'var(--warn-bg)', fg: 'var(--warn)' },
  info: { bg: 'var(--info-bg)', fg: 'var(--info)' },
  graphite: { bg: 'var(--dark)', fg: 'var(--dark-ink)' },
};

/** Clickable row of every Programme/Project lifecycle status, current one emphasised. */
export function ProgrammeStatusBar({ value, onChange }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
      {PROGRAMME_STATUSES.map((status) => {
        const { bg, fg } = STATUS_TONE_STYLE[PROGRAMME_STATUS_TONE[status]];
        const isActive = status === value;
        return (
          <Box
            key={status}
            component="button"
            type="button"
            onClick={() => onChange(status)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.9,
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              lineHeight: 1,
              color: fg,
              bgcolor: bg,
              border: '2px solid',
              borderColor: isActive ? fg : 'transparent',
              borderRadius: 999,
              px: 2,
              py: 1.1,
              cursor: 'pointer',
              opacity: isActive ? 1 : 0.65,
              boxShadow: isActive ? `0 4px 14px -6px ${fg}` : 'none',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.15s ease',
              '&:hover': { opacity: 1 },
            }}
          >
            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: fg, flexShrink: 0 }} />
            {status}
          </Box>
        );
      })}
    </Box>
  );
}
