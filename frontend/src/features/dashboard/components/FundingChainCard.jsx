import { Box, Card, Stack, Typography } from '@mui/material';
import { formatInr } from '../../../lib/format/currency.js';

/**
 * "The funding chain" — the signature dashboard visual, driven by the
 * server-side summary. Committed and Received are real (Received = sum of
 * tranche receipts); Utilised is the seeded placeholder. Every grant moves
 * Committed → Received → Utilised, with Available = Received − Utilised.
 */
const STEPS = [
  ['committed', 'Committed', 'contracted / signed (receivable)'],
  ['received', 'Received', 'cash in bank → income recognised'],
  ['utilised', 'Utilised', 'spent against budget lines'],
  ['available', 'Available', 'received − utilised'],
];

function Dot({ color }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        mr: 0.75,
        verticalAlign: '1px',
        bgcolor: color,
      }}
    />
  );
}

export function FundingChainCard({ totals }) {
  const denom = totals.committed + totals.blocked || 1;
  const pct = (v) => `${(100 * v) / denom}%`;
  const receivedPctLabel = Math.round((100 * totals.received) / denom);

  return (
    <Card>
      <Box sx={{ px: 2.5, pt: 2, pb: 0.5 }}>
        <Typography variant="h6" sx={{ fontSize: 17 }}>
          The funding chain
        </Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
          Every grant moves through four states. A commitment is a promise, not income; only
          received money can be utilised.
        </Typography>
      </Box>

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

      {/* Segmented received / open / blocked bar */}
      <Box
        role="img"
        aria-label={`Received ${formatInr(totals.received)}, open ${formatInr(
          totals.open,
        )}, blocked ${formatInr(totals.blocked)}`}
        sx={{
          display: 'flex',
          height: 9,
          borderRadius: 99,
          overflow: 'hidden',
          mx: 2.5,
          my: 1.25,
          bgcolor: 'var(--card2)',
        }}
      >
        <Box sx={{ width: pct(totals.received), bgcolor: 'success.main' }} />
        <Box sx={{ width: pct(totals.open), bgcolor: 'var(--line)' }} />
        <Box sx={{ width: pct(totals.blocked), bgcolor: 'error.main', opacity: 0.6 }} />
      </Box>

      <Stack
        direction="row"
        flexWrap="wrap"
        sx={{ gap: 2.25, px: 2.5, pb: 2, fontSize: 11.5, color: 'text.secondary' }}
      >
        <span>
          <Dot color="success.main" />
          <Box component="b" sx={{ color: 'text.primary' }}>
            Received {formatInr(totals.received)}
          </Box>{' '}
          ({receivedPctLabel}%)
        </span>
        <span>
          <Dot color="var(--line)" />
          Open / outstanding{' '}
          <Box component="b" sx={{ color: 'text.primary' }}>
            {formatInr(totals.open)}
          </Box>
        </span>
        {totals.blocked > 0 ? (
          <span>
            <Dot color="error.main" />
            Blocked (draft donor){' '}
            <Box component="b" sx={{ color: 'text.primary' }}>
              {formatInr(totals.blocked)}
            </Box>{' '}
            — excluded from open
          </span>
        ) : null}
      </Stack>

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
