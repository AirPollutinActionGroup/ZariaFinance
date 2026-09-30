import { Box, Card, Stack, Typography } from '@mui/material';
import { formatInrExact } from '../../../lib/format/currency.js';
import { BookSplit, Caption, PeriodBar, pct, plural, SplitRow, Tile } from '../../credit-notes/components/CreditSummaryCard.jsx';

/**
 * Debit Notes summary strip — same layout as the Credit Notes one. Reflects
 * whatever `summary` it's given; the list page passes the filtered notes, so
 * the figures follow the filters.
 */
export function DebitSummaryCard({ summary, period, filtered = false, totalCount, onClearFilters }) {
  const s = summary;
  const fundPct = pct(s.toFund.amount, s.issuedTotal);
  const notToFund = s.issuedTotal - s.toFund.amount;

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
        <Tile accent="error.main" label="Added to Spent" value={formatInrExact(s.issuedTotal)} valueColor="error.main">
          <Box sx={{ mt: 1, height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${fundPct}%`, bgcolor: 'error.main', borderRadius: 3, transition: 'width .3s ease' }} />
          </Box>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {plural(s.issuedCount, 'note')} · {plural(s.lineCount, 'line')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{fundPct}% to funds</Typography>
          </Stack>
        </Tile>

        <Tile accent="info.main" label="Charged to funds" value={formatInrExact(s.toFund.amount)}>
          <Caption>
            {s.toFund.count
              ? `${plural(s.fundCount, 'fund profile')} · ${plural(s.donorCount, 'donor')}`
              : 'No notes charged to a fund yet'}
          </Caption>
          {s.issuedCount > s.toFund.count ? (
            <Caption sx={{ mt: 0.25 }}>{formatInrExact(notToFund)} not charged to a fund</Caption>
          ) : null}
        </Tile>

        <Tile accent="warning.main" label="By budget" value={plural(s.issuedCount, 'note')} last>
          <SplitRow color="warning.main" label="Over budget" amount={s.overBudget.amount} count={s.overBudget.count} />
          <SplitRow color="text.secondary" label="Within budget" amount={s.withinBudget.amount} count={s.withinBudget.count} />
        </Tile>

      </Stack>

      <BookSplit byBook={s.byBook} total={s.issuedTotal} />
    </Card>
  );
}
