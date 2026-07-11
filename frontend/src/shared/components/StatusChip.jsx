import { Chip } from '@mui/material';

// Tone → colour pair, expressed with the theme's CSS custom properties so the
// pill adapts to light/dark automatically (see styles/theme.css).
const TONE_STYLES = {
  neutral: { backgroundColor: 'var(--card2)', color: 'var(--muted)' },
  graphite: { backgroundColor: 'var(--dark)', color: 'var(--dark-ink)' },
  outlined: {
    backgroundColor: 'transparent',
    color: 'var(--muted)',
    border: '1px solid var(--line)',
  },
  success: { backgroundColor: 'var(--ok-bg)', color: 'var(--ok)' },
  warning: { backgroundColor: 'var(--warn-bg)', color: 'var(--warn)' },
  error: { backgroundColor: 'var(--err-bg)', color: 'var(--err)' },
  info: { backgroundColor: 'var(--info-bg)', color: 'var(--info)' },
};

/**
 * Small status pill in the Zariya register style (e.g. "Domestic" neutral,
 * "Foreign · FCRA" graphite, "Restricted" outlined). Tone is passed by domain
 * components which own the mapping from backend enum → tone.
 */
export function StatusChip({ label, tone = 'neutral', size = 'small' }) {
  return <Chip label={label} size={size} sx={{ ...TONE_STYLES[tone] }} />;
}
