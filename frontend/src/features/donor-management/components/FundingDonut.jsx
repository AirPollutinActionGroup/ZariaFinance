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

  const denom = safeCommitted || 1;
  const utilisedPct = Math.round((100 * safeUtilised) / denom);
  const availablePct = Math.round((100 * available) / denom);
  const awaitingPct = Math.round((100 * awaiting) / denom);

  const segments = [
    { label: 'Utilised', value: safeUtilised, pct: utilisedPct, color: '#F57C00' },
    { label: 'Available', value: available, pct: availablePct, color: '#00ACC1' },
    { label: 'Awaiting receipt', value: awaiting, pct: awaitingPct, color: '#1E88E5' },
  ];

  let offset = 0;

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
        <svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Funding position split">
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--line2, #e0e0e0)" strokeWidth={STROKE} />
          <g transform="rotate(-90 70 70)">
            {segments.map((s) => {
              const frac = safeCommitted > 0 ? s.value / safeCommitted : 0;
              const len = Math.max(0, frac * CIRC - 2);
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
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1, fontSize: 10 }}>
            Committed
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25, fontSize: 13.5 }}>
            {formatInr(safeCommitted)}
          </Typography>
        </Box>
      </Box>

      <Stack spacing={1} sx={{ minWidth: 0, flexGrow: 1 }}>
        {segments.map((s) => (
          <Box
            key={s.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.25,
              py: 0.75,
              borderRadius: 1,
              bgcolor: 'var(--card2, rgba(0, 0, 0, 0.02))',
              borderLeft: `3px solid ${s.color}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary' }}>
              {s.label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 12.5, fontVariantNumeric: 'tabular-nums' }}>
              {formatInr(s.value)}{' '}
              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: 10.5 }}>
                ({s.pct}%)
              </Box>
            </Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
