import { Box, Button, Card, Stack, Typography } from '@mui/material';
import { formatInrExact } from '../../../lib/format/currency.js';

const VALUE_SX = { fontFamily: 'monospace', fontWeight: 700, fontSize: 25, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' };
export const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);
export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** One KPI tile: coloured rail, dot-label, big monospace value, footer content — as on the Outflow Budget. */
export function Tile({ accent, label, value, valueColor, children, last = false }) {
  return (
    <Box
      sx={{
        position: 'relative',
        flex: 1,
        minWidth: 0,
        p: 2.25,
        pl: 3,
        borderRight: last ? 'none' : { md: '1px solid' },
        borderBottom: last ? 'none' : { xs: '1px solid', md: 'none' },
        borderColor: 'divider',
      }}
    >
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent }} />
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: accent }} />
        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.09em', color: 'text.secondary', fontSize: 10.5, fontWeight: 600 }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ ...VALUE_SX, color: valueColor }}>{value}</Typography>
      {children}
    </Box>
  );
}

export function Caption({ children, sx }) {
  return (
    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5, fontVariantNumeric: 'tabular-nums', ...sx }}>
      {children}
    </Typography>
  );
}

/** Label · amount (count) row inside a tile. */
export function SplitRow({ color, label, amount, count }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
      <Box sx={{ width: 7, height: 7, borderRadius: '2px', bgcolor: color, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: 'text.secondary', flex: 1 }}>{label}</Typography>
      <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>
        {formatInrExact(amount)} <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>({count})</Box>
      </Typography>
    </Stack>
  );
}

/** Top bar of a summary card: which period the figures cover, and whether other filters narrow them further. */
export function PeriodBar({ period, shown, totalCount, filtered = false, onClearFilters }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ px: 3, py: 0.75, borderBottom: '1px solid', borderColor: 'divider', bgcolor: filtered ? 'var(--info-bg)' : 'var(--card2)' }}
    >
      <Typography variant="caption" sx={{ color: filtered ? 'var(--info)' : 'text.secondary', fontWeight: 600, flex: 1 }}>
        {period || 'All financial years'} · {plural(shown, 'note')}
        {shown !== totalCount ? ` of ${totalCount}` : ''}
        {filtered ? ' · filtered' : ''}
      </Typography>
      {filtered && onClearFilters ? (
        <Button size="small" color="inherit" onClick={onClearFilters} sx={{ py: 0, minHeight: 0 }}>
          Clear filters
        </Button>
      ) : null}
    </Stack>
  );
}

/** Bottom bar of a summary card: LC / FC split of the issued total. */
export function BookSplit({ byBook, total }) {
  const lcPct = pct(byBook.LC.amount, total);
  const fcPct = pct(byBook.FC.amount, total);
  return (
    <Stack
      direction="row"
      spacing={3}
      alignItems="center"
      sx={{ px: 3, py: 1.25, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'var(--card2)', flexWrap: 'wrap', rowGap: 0.5 }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10 }}>
        By book
      </Typography>
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Box sx={{ width: 7, height: 7, borderRadius: '2px', bgcolor: 'info.main' }} />
        <Typography variant="caption" sx={{ color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
          LC {formatInrExact(byBook.LC.amount)} <Box component="span" sx={{ color: 'text.secondary' }}>({lcPct}% · {byBook.LC.count})</Box>
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.75} alignItems="center">
        <Box sx={{ width: 7, height: 7, borderRadius: '2px', bgcolor: 'text.secondary' }} />
        <Typography variant="caption" sx={{ color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
          FC {formatInrExact(byBook.FC.amount)} <Box component="span" sx={{ color: 'text.secondary' }}>({fcPct}% · {byBook.FC.count})</Box>
        </Typography>
      </Stack>
      <Box sx={{ flex: 1, minWidth: 120, height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden', display: 'flex' }}>
        <Box sx={{ width: `${lcPct}%`, bgcolor: 'info.main' }} />
        <Box sx={{ width: `${fcPct}%`, bgcolor: 'text.secondary' }} />
      </Box>
    </Stack>
  );
}

/**
 * Credit Notes summary strip. Reflects whatever `summary` it's given — the
 * list page passes the filtered notes, so the figures follow the filters.
 */
export function CreditSummaryCard({ summary, period, filtered = false, totalCount, onClearFilters }) {
  const s = summary;
  const fundPct = pct(s.toFundTotal, s.issuedTotal);

  return (
    <Card sx={{ mb: 3.5, overflow: 'hidden' }}>
      <PeriodBar
        period={period}
        shown={s.issuedCount}
        totalCount={totalCount}
        filtered={filtered}
        onClearFilters={onClearFilters}
      />

      <Stack direction={{ xs: 'column', md: 'row' }}>
        <Tile accent="success.main" label="Total credited" value={formatInrExact(s.issuedTotal)} valueColor="success.main">
          <Box sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${fundPct}%`, bgcolor: 'success.main', borderRadius: 3, transition: 'width .3s ease' }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{plural(s.issuedCount, 'note')}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{fundPct}% to funds</Typography>
          </Stack>
        </Tile>

        <Tile accent="info.main" label="Returned to funds" value={formatInrExact(s.toFundTotal)}>
          <Caption>
            {s.toFundCount
              ? `${plural(s.fundCount, 'fund profile')} · ${plural(s.donorCount, 'donor')}`
              : 'No notes returned to a fund yet'}
          </Caption>
          {s.byDisbursement.None.count ? (
            <Caption sx={{ mt: 0.25 }}>
              {formatInrExact(s.byDisbursement.None.amount)} not returned to a fund
            </Caption>
          ) : null}
        </Tile>

        <Tile accent="text.secondary" label="By disbursement" value={plural(s.toFundCount, 'note')} last>
          <SplitRow color="info.main" label="Tranches" amount={s.byDisbursement.Tranches.amount} count={s.byDisbursement.Tranches.count} />
          <SplitRow color="text.secondary" label="Lump Sum" amount={s.byDisbursement['Lump Sum'].amount} count={s.byDisbursement['Lump Sum'].count} />
        </Tile>

      </Stack>

      <BookSplit byBook={s.byBook} total={s.issuedTotal} />
    </Card>
  );
}
