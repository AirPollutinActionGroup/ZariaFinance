import { Box, Card, Stack, Typography } from '@mui/material';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';

const MONEY_SX = { fontFamily: 'monospace', fontWeight: 700, fontSize: 25, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' };

/** One KPI tile: coloured rail, dot-label, big monospace value, optional footer content. */
function Tile({ accent, dot, label, value, valueColor, children, borderRight, borderBottom }) {
  return (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        p: 2.25,
        pl: 3,
        borderRight,
        borderBottom,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent }} />
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: dot }} />
        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.09em', color: 'text.secondary', fontSize: 10.5, fontWeight: 600 }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ ...MONEY_SX, color: valueColor }}>{value}</Typography>
      {children}
    </Box>
  );
}

/**
 * Expected / Received / Outstanding as a single dense ledger strip — a
 * collection-rate meter under Received, and the book split as a footer row —
 * instead of three disconnected KPI cards plus a separate chart.
 */
export function BudgetSummaryCard({ kpis, lineCount, asAt }) {
  const { totalBudgeted, totalReceived, totalOutstanding, byBook } = kpis;
  const receivedPct = totalBudgeted > 0 ? Math.min(100, Math.round((totalReceived / totalBudgeted) * 100)) : 0;

  const lc = byBook.LC || { budgeted: 0, received: 0 };
  const fc = byBook.FC || { budgeted: 0, received: 0 };
  const lcPct = totalBudgeted > 0 ? Math.round((lc.budgeted / totalBudgeted) * 100) : 0;
  const fcPct = totalBudgeted > 0 ? Math.round((fc.budgeted / totalBudgeted) * 100) : 0;

  return (
    <Card sx={{ mb: 3.5, overflow: 'hidden' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }}>
        <Tile
          accent="text.secondary"
          dot="text.secondary"
          label="Expected"
          value={formatInrExact(totalBudgeted)}
          borderRight={{ sm: '1px solid' }}
          borderBottom={{ xs: '1px solid', sm: 'none' }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            {lineCount} budget lines · expected
          </Typography>
        </Tile>

        <Tile
          accent="success.main"
          dot="success.main"
          label="Received"
          value={formatInrExact(totalReceived)}
          valueColor="success.main"
          borderRight={{ sm: '1px solid' }}
          borderBottom={{ xs: '1px solid', sm: 'none' }}
        >
          <Box sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${receivedPct}%`, bgcolor: 'success.main', borderRadius: 3, transition: 'width .3s ease' }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{receivedPct}% of expected</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>as at {formatDate(asAt)}</Typography>
          </Stack>
        </Tile>

        <Tile accent="warning.main" dot="warning.main" label="Outstanding" value={formatInrExact(totalOutstanding)} valueColor="warning.main">
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            still expected across the rest of the FY
          </Typography>
        </Tile>
      </Stack>

      <Stack
        direction="row"
        spacing={3}
        sx={{ px: 3, py: 1.25, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'var(--card2)', flexWrap: 'wrap', rowGap: 0.5 }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>
          By book
        </Typography>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ width: 7, height: 7, borderRadius: '2px', bgcolor: 'info.main' }} />
          <Typography variant="caption" sx={{ color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
            LC {formatInrExact(lc.budgeted)} <Box component="span" sx={{ color: 'text.secondary' }}>({lcPct}%)</Box>
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Box sx={{ width: 7, height: 7, borderRadius: '2px', bgcolor: 'text.secondary' }} />
          <Typography variant="caption" sx={{ color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
            FC {formatInrExact(fc.budgeted)} <Box component="span" sx={{ color: 'text.secondary' }}>({fcPct}%)</Box>
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
