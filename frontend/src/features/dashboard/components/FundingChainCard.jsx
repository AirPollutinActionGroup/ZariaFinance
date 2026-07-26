import { Box, Card, Stack, Typography } from '@mui/material';
import { formatInr } from '../../../lib/format/currency.js';

const STEPS = [
  ['committed', 'Committed', 'contracted / signed (receivable)'],
  ['received', 'Received', 'cash in bank → income recognised'],
  ['utilised', 'Utilised', 'spent against budget lines'],
  ['available', 'Available', 'received − utilised'],
];

const R = 54;
const STROKE = 18;
const CIRC = 2 * Math.PI * R;

export function FundingChainCard({ totals }) {
  const denom = totals.committed + totals.blocked || 1;
  const receivedPct = Math.round((100 * totals.received) / denom);
  const openPct = Math.round((100 * totals.open) / denom);
  const blockedPct = Math.round((100 * totals.blocked) / denom);

  const segments = [
    { label: 'Received', value: totals.received, pct: receivedPct, color: 'success.main' },
    { label: 'Open / Outstanding', value: totals.open, pct: openPct, color: 'warning.main' },
    { label: 'Blocked (Draft)', value: totals.blocked, pct: blockedPct, color: 'error.main' },
  ];

  let offset = 0;

  return (
    <Card>
      {/* Header */}
      <Box sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
        <Typography variant="h6" sx={{ fontSize: 17 }}>
          The funding chain
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
          Every grant moves through four states. A commitment is a promise, not income; only
          received money can be utilised.
        </Typography>
      </Box>

      {/* Top 4 Pipeline Metric Steps */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: '6px 10px',
          px: 2.5,
          py: 1,
        }}
      >
        {STEPS.map(([key, label, desc], i) => (
          <Box key={key} sx={{ position: 'relative' }}>
            {i > 0 ? (
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  left: -8,
                  top: 20,
                  color: 'text.disabled',
                  fontSize: 15,
                  lineHeight: 1,
                  display: { xs: 'none', sm: 'block' },
                }}
              >
                →
              </Box>
            ) : null}
            <Typography variant="overline" sx={{ fontSize: 9.5, display: 'block' }}>
              {label}
            </Typography>
            <Typography
              sx={{
                fontFamily: (t) => t.typography.h2.fontFamily,
                fontSize: 22,
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: key === 'available' ? 'success.main' : 'text.primary',
                my: 0.25,
              }}
            >
              {formatInr(totals[key])}
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{desc}</Typography>
          </Box>
        ))}
      </Box>

      {/* SVG PIE / DONUT CHART SECTION WITH COMPACT SIDE LEGEND */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={4}
        sx={{ alignItems: 'center', px: 2.5, py: 2 }}
      >
        {/* SVG Pie Chart Circle */}
        <Box sx={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
          <svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Funding Pie Chart">
            <circle cx="70" cy="70" r={R} fill="none" stroke="var(--line2)" strokeWidth={STROKE} />
            <g transform="rotate(-90 70 70)">
              {segments.map((s) => {
                const frac = denom > 0 ? s.value / denom : 0;
                const len = Math.max(0, frac * CIRC - 2);
                const el = (
                  <circle
                    key={s.label}
                    cx="70"
                    cy="70"
                    r={R}
                    fill="none"
                    stroke={
                      s.color === 'success.main'
                        ? '#1E6B4A'
                        : s.color === 'warning.main'
                          ? '#8F6A12'
                          : '#B3372B'
                    }
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
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10, lineHeight: 1 }}>
              Total Pipeline
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25, fontSize: 14 }}>
              {formatInr(denom)}
            </Typography>
          </Box>
        </Box>

        {/* Compact Legend List Right Next to the Chart */}
        <Stack spacing={1.5} sx={{ minWidth: 0, flexGrow: 1 }}>
          {segments.map((s) => (
            <Stack key={s.label} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '3px',
                  bgcolor: s.color,
                  flexShrink: 0,
                  mt: 0.4,
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12.5, lineHeight: 1.2 }}>
                  {s.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 14.5, mt: 0.25 }}>
                  {formatInr(s.value)}{' '}
                  <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400, fontSize: 11.5 }}>
                    ({s.pct}%)
                  </Box>
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Stack>

      {/* Explanation Banner */}
      <Box
        sx={{
          mx: 2.5,
          mb: 2,
          px: 1.75,
          py: 1.25,
          borderRadius: 1.5,
          bgcolor: 'var(--card2)',
          borderLeft: '3px solid',
          borderColor: 'divider',
          fontSize: 11.5,
          color: 'text.secondary',
        }}
      >
        <Box component="b" sx={{ color: 'text.primary' }}>
          Funding committed (receivable) — income side.
        </Box>{' '}
        Money donors have contractually promised. Sits in the trading / committed layer as pipeline;
        becomes income only when received.
      </Box>
    </Card>
  );
}
