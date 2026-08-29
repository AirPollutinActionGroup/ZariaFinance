import { useMemo, useState } from 'react';
import { Box, FormControl, Grid, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DataTable, PageHeader, SearchField, StatCard, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { BOOK, BOOK_TONE } from '../../donation-management/constants.js';
import { getInflowRows } from '../data/inflowRepository.js';
import { getRowStatus } from '../lib/status.js';
import {
  AS_AT_DATE,
  OVERDUE_THRESHOLD_DAYS,
  RECEIPT_STATUS,
  RECEIPT_STATUS_TONE,
  RESTRICTION_TONE,
  RESTRICTION_TYPE,
} from '../constants.js';

const MONEY_SX = { fontVariantNumeric: 'tabular-nums' };

const AGEING_META = {
  onTime: { label: 'On time / ahead', desc: 'received on or before the expected date', color: 'var(--ok)', unit: 'receipts' },
  slipped: { label: 'Slipped', desc: `1–${OVERDUE_THRESHOLD_DAYS} days past the expected date`, color: 'var(--warn)', unit: 'tranches' },
  overdue: { label: 'Overdue', desc: `${OVERDUE_THRESHOLD_DAYS}+ days past the expected date`, color: 'var(--err)', unit: 'tranches' },
};

/** Legend-row tile in the funding-chain style: coloured rail, label/desc left, amount/count right. */
function AgeingTile({ meta, amount, count }) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.5,
        px: 2,
        py: 1.75,
        borderRadius: 1.5,
        bgcolor: 'var(--card2)',
        borderLeft: '3px solid',
        borderLeftColor: meta.color,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.2 }}>
          {meta.label}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10.5, display: 'block', mt: 0.25 }}>
          {meta.desc}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
        <Typography sx={{ ...MONEY_SX, fontWeight: 700, fontSize: 16 }}>{formatInrExact(amount)}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 10.5 }}>
          {count} {meta.unit}
        </Typography>
      </Box>
    </Box>
  );
}

export function InflowBudgetPage() {
  const navigate = useNavigate();
  const [rows] = useState(() => getInflowRows());
  const [searchQuery, setSearchQuery] = useState('');
  const [bookFilter, setBookFilter] = useState('All');
  const [restrictionFilter, setRestrictionFilter] = useState('All');

  const asAt = useMemo(() => new Date(AS_AT_DATE), []);

  const rowsWithStatus = useMemo(
    () => rows.map((row) => ({ ...row, status: getRowStatus(row, asAt) })),
    [rows, asAt],
  );

  const filteredRows = useMemo(() => {
    return rowsWithStatus.filter((row) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || row.id.toLowerCase().includes(q) || row.donor.toLowerCase().includes(q);
      const matchesBook = bookFilter === 'All' || row.book === bookFilter;
      const matchesRestriction = restrictionFilter === 'All' || row.restriction === restrictionFilter;
      return matchesSearch && matchesBook && matchesRestriction;
    });
  }, [rowsWithStatus, searchQuery, bookFilter, restrictionFilter]);

  const kpis = useMemo(() => {
    const totalExpected = rows.reduce((sum, r) => sum + r.expectedAmount, 0);
    const totalReceived = rows.reduce((sum, r) => sum + (r.actualAmount || 0), 0);
    return { totalExpected, totalReceived, totalOutstanding: totalExpected - totalReceived };
  }, [rows]);

  const ageing = useMemo(() => {
    const onTime = { count: 0, amount: 0 };
    const slipped = { count: 0, amount: 0 };
    const overdue = { count: 0, amount: 0 };
    for (const row of rowsWithStatus) {
      if (row.status === RECEIPT_STATUS.RECEIVED) {
        if (new Date(row.actualDate) <= new Date(row.expectedDate)) {
          onTime.count += 1;
          onTime.amount += row.actualAmount;
        }
      } else if (row.status === RECEIPT_STATUS.SLIPPED) {
        slipped.count += 1;
        slipped.amount += row.expectedAmount;
      } else if (row.status === RECEIPT_STATUS.OVERDUE) {
        overdue.count += 1;
        overdue.amount += row.expectedAmount;
      }
    }
    return { onTime, slipped, overdue };
  }, [rowsWithStatus]);

  const columns = [
    {
      key: 'id',
      header: 'Tranche / donation',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 12.5 }}>
            {row.id}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.15 }}>
            {row.donor}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'restriction',
      header: 'Restriction',
      render: (row) => (
        <StatusChip label={RESTRICTION_TYPE[row.restriction]} tone={RESTRICTION_TONE[row.restriction]} />
      ),
    },
    {
      key: 'book',
      header: 'Book',
      render: (row) => <StatusChip label={row.book} tone={BOOK_TONE[row.book]} />,
    },
    {
      key: 'expectedDate',
      header: 'Expected date',
      render: (row) => formatDate(row.expectedDate),
    },
    {
      key: 'expectedAmount',
      header: 'Expected',
      align: 'right',
      render: (row) => <Box sx={MONEY_SX}>{formatInrExact(row.expectedAmount)}</Box>,
    },
    {
      key: 'actualDate',
      header: 'Actual date',
      render: (row) => (row.actualDate ? formatDate(row.actualDate) : '—'),
    },
    {
      key: 'actualAmount',
      header: 'Actual',
      align: 'right',
      render: (row) => (
        <Box sx={{ ...MONEY_SX, fontWeight: row.actualAmount != null ? 700 : 400, color: row.actualAmount != null ? 'success.main' : 'text.secondary' }}>
          {row.actualAmount != null ? formatInrExact(row.actualAmount) : '—'}
        </Box>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusChip label={row.status} tone={RECEIPT_STATUS_TONE[row.status]} />,
    },
    {
      key: 'outstanding',
      header: 'Outstanding',
      align: 'right',
      render: (row) => (
        <Box sx={{ ...MONEY_SX, color: row.actualAmount != null ? 'text.secondary' : 'text.primary', fontWeight: row.actualAmount != null ? 400 : 600 }}>
          {row.actualAmount != null ? '—' : formatInrExact(row.expectedAmount)}
        </Box>
      ),
    },
  ];

  const receivedPct = kpis.totalExpected > 0 ? Math.round((kpis.totalReceived / kpis.totalExpected) * 100) : 0;

  return (
    <Box sx={{ maxWidth: 1400 }}>
      <PageHeader
        title="Inflow Budget"
        subtitle="Expected vs actual inflow across every donor and grant — fed automatically; you only record what arrives."
      />

      <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Expected" value={formatInrExact(kpis.totalExpected)} hint={`${rows.length} tranches & donations`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            label="Received"
            value={formatInrExact(kpis.totalReceived)}
            hint={`${receivedPct}% of expected · as at ${formatDate(AS_AT_DATE)}`}
            accent
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard label="Outstanding" value={formatInrExact(kpis.totalOutstanding)} hint="yet to arrive" />
        </Grid>
      </Grid>

      <Box
        sx={{
          mb: 3.5,
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
          No re-entry.
        </Box>{' '}
        Donor, grant, tranche schedule, restriction and book are inherited from the donor module. Open a row to
        record what arrives — actual date, actual amount, bank reference and, if it differs from what was
        expected, the variance reason.
      </Box>

      <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
        Ageing
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AgeingTile meta={AGEING_META.onTime} amount={ageing.onTime.amount} count={ageing.onTime.count} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AgeingTile meta={AGEING_META.slipped} amount={ageing.slipped.amount} count={ageing.slipped.count} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AgeingTile meta={AGEING_META.overdue} amount={ageing.overdue.amount} count={ageing.overdue.count} />
        </Grid>
      </Grid>

      <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
        Inflow schedule
      </Typography>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box sx={{ width: { xs: '100%', sm: 340 } }}>
          <SearchField placeholder="Search tranche ID or donor…" value={searchQuery} onChange={setSearchQuery} />
        </Box>
        <Stack direction="row" spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={bookFilter} onChange={(e) => setBookFilter(e.target.value)}>
              <MenuItem value="All">All Books</MenuItem>
              {Object.keys(BOOK).map((code) => (
                <MenuItem key={code} value={code}>{code}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <Select value={restrictionFilter} onChange={(e) => setRestrictionFilter(e.target.value)}>
              <MenuItem value="All">All Restrictions</MenuItem>
              {Object.entries(RESTRICTION_TYPE).map(([code, label]) => (
                <MenuItem key={code} value={code}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <DataTable
        columns={columns}
        rows={filteredRows}
        getRowKey={(row) => row.id}
        emptyTitle="No inflow rows found"
        emptyDescription="Try adjusting your search query or filters."
        onRowClick={(row) => navigate(`/inflow-budget/${row.id}`)}
      />

      <Stack direction="row" spacing={2.5} sx={{ mt: 1.5, px: 0.5, flexWrap: 'wrap', rowGap: 0.75 }}>
        {Object.entries(RECEIPT_STATUS_TONE).map(([status, tone]) => (
          <Stack key={status} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: `${tone === 'neutral' ? 'text.secondary' : `${tone}.main`}` }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{status}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
