import { Box, Stack, Typography } from '@mui/material';
import { formatInr } from '../../../lib/format/currency.js';

const R = 54;
const STROKE = 18;
const CIRC = 2 * Math.PI * R;

/**
 * Funding-position donut: the committed total split into how much has been
 * utilised, what is available (received − utilised) and what is still awaiting
 * receipt (committed − received). These three sum to committed, so a donut is
 * the right form (parts of one whole); committed-vs-received sequential stages
 * are left to the table above (see design guidance, §7).
 *
 * Identity is carried by the legend labels + values, never colour alone; colours
 * are the theme's semantic tokens so it adapts to light/dark.
 */
export function FundingDonut({ committed, received, utilised }) {
  const safeCommitted = Math.max(0, Number(committed) || 0);
  const safeReceived = Math.min(safeCommitted, Math.max(0, Number(received) || 0));
  const safeUtilised = Math.min(safeReceived, Math.max(0, Number(utilised) || 0));
  const available = safeReceived - safeUtilised;
  const awaiting = safeCommitted - safeReceived;

  const segments = [
    { label: 'Utilised', value: safeUtilised, color: 'var(--info)' },
    { label: 'Available', value: available, color: 'var(--ok)' },
    { label: 'Awaiting receipt', value: awaiting, color: 'var(--line)' },
  ];

  let offset = 0;

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
        <svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Funding position split">
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--line2)" strokeWidth={STROKE} />
          <g transform="rotate(-90 70 70)">
            {segments.map((s) => {
              const frac = safeCommitted > 0 ? s.value / safeCommitted : 0;
              const len = Math.max(0, frac * CIRC - 2); // 2px surface gap between fills
              const el = (
                <circle
                  key={s.label}
                  cx="70"
                  cy="70"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${len} ${CIRC - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              );
              offset += frac * CIRC;
              return el;
            })}
          </g>
        </svg>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
            Committed
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25 }}>
            {formatInr(safeCommitted)}
          </Typography>
        </Box>
      </Box>

      <Stack spacing={1} sx={{ minWidth: 0, flexGrow: 1 }}>
        {segments.map((s) => (
          <Stack key={s.label} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: s.color, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ flexGrow: 1, color: 'text.secondary' }}>
              {s.label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
              {formatInr(s.value)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
