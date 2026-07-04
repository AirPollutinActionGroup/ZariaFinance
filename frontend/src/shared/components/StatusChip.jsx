import { Chip } from '@mui/material';
import { accent, graphite, semantic } from '../../theme/tokens.js';

const TONE_STYLES = {
  neutral: { bgcolor: graphite[100], color: graphite[700] },
  graphite: { background: accent.gradient, color: accent.platinum },
  outlined: { bgcolor: 'transparent', color: graphite[600], border: `1px solid ${graphite[300]}` },
  success: { bgcolor: semantic.success.light, color: semantic.success.dark },
  warning: { bgcolor: semantic.warning.light, color: semantic.warning.dark },
  error: { bgcolor: semantic.error.light, color: semantic.error.dark },
  info: { bgcolor: semantic.info.light, color: semantic.info.dark },
};

/**
 * Small status pill, visually matching the register chips in the approved
 * design (e.g. "Domestic" neutral, "Foreign · FCRA" graphite, "Restricted"
 * outlined). Tone is passed by domain components which own the mapping
 * from backend enum → tone.
 */
export function StatusChip({ label, tone = 'neutral', size = 'small' }) {
  return <Chip label={label} size={size} sx={{ ...TONE_STYLES[tone] }} />;
}
