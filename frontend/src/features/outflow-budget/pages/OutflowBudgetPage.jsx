import { useMemo, useState } from 'react';
import { Box, FormControl, Grid, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { BOOK, BOOK_TONE } from '../../donation-management/constants.js';
import { useOutflowRows } from '../hooks/useOutflow.js';
import { useBudgetFinancialYears } from '../../budget/hooks/useBudgets.js';
import { BUDGET_TYPE, BUDGET_TYPE_TONE } from '../../budget/constants.js';
import { BudgetSummaryCard } from '../components/BudgetSummaryCard.jsx';
import { OVERDUE_THRESHOLD_DAYS, PAYMENT_STATUS, PAYMENT_STATUS_TONE } from '../constants.js';

const MONEY_SX = { fontVariantNumeric: 'tabular-nums' };

const AGEING_META = {
  spent: { label: 'Fully spent', desc: 'debit notes cover the budgeted amount', color: 'var(--ok)', unit: 'rows' },
  pending: { label: 'Pending', desc: `1–${OVERDUE_THRESHOLD_DAYS} days past the quarter's end`, color: 'var(--warn)', unit: 'rows' },
  overdue: { label: 'Overdue', desc: `${OVERDUE_THRESHOLD_DAYS}+ days past the quarter's end`, color: 'var(--err)', unit: 'rows' },
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

/** Outflow schedule — /outflow-budget. Rows come from APPROVED budgets; Spent = debit notes. */
export function OutflowBudgetPage() {
  const navigate = useNavigate();
  const fyMaster = useBudgetFinancialYears();
  const [fyChoice, setFyChoice] = useState(null); // null → the year running today
  const fy = fyChoice ?? fyMaster.activeLabel ?? 'All';
  const rowsQuery = useOutflowRows(fy === 'All' ? undefined : fy);
  const rows = useMemo(() => rowsQuery.data || [], [rowsQuery.data]);

  const [searchQuery, setSearchQuery] = useState('');
  const [bookFilter, setBookFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !q || [row.id, row.line, row.budgetName, row.scope, row.categoryName].some((t) => (t || '').toLowerCase().includes(q));
      const matchesBook = bookFilter === 'All' || row.book === bookFilter;
      const matchesType = typeFilter === 'All' || row.budgetType === typeFilter;
      return matchesSearch && matchesBook && matchesType;
    });
  }, [rows, searchQuery, bookFilter, typeFilter]);

  // Summary and ageing describe the whole selected year (not the table filters).
  const kpis = useMemo(() => {
    const sum = (pick) => rows.reduce((s, r) => s + pick(r), 0);
    const totalBudgeted = sum((r) => r.expectedAmount);
    const totalSpent = sum((r) => r.spent);
    const byBook = rows.reduce((acc, r) => {
      const bucket = acc[r.book] || (acc[r.book] = { budgeted: 0, spent: 0 });
      bucket.budgeted += r.expectedAmount;
      bucket.spent += r.spent;
      return acc;
    }, {});
    return {
      totalBudgeted,
      totalSpent,
      totalDebits: sum((r) => r.debitTotal),
      totalRemaining: totalBudgeted - totalSpent,
      byBook,
    };
  }, [rows]);

  const ageing = useMemo(() => {
    const bucket = () => ({ count: 0, amount: 0 });
    const result = { spent: bucket(), pending: bucket(), overdue: bucket() };
    for (const row of rows) {
      if (row.status === 'PAID') {
        result.spent.count += 1;
        result.spent.amount += row.spent;
      } else if (row.status === 'PENDING' || row.status === 'OVERDUE') {
        const b = row.status === 'PENDING' ? result.pending : result.overdue;
        b.count += 1;
        b.amount += Math.max(0, row.remaining); // what's still to go out
      }
    }
    return result;
  }, [rows]);

  const columns = [
    {
      key: 'id',
      header: 'Budget line · quarter',
      render: (row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 12.5 }}>
            {row.budgetCode} · {row.lineCode} · Q{row.quarter}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.15 }}>
            {row.line}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'scope',
      header: 'Budget / scope',
      render: (row) => (
        <Box>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <StatusChip label={BUDGET_TYPE[row.budgetType]} tone={BUDGET_TYPE_TONE[row.budgetType]} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.scope}</Typography>
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.4 }}>
            {row.categoryName}{row.stateName ? ` · ${row.stateName}` : ''}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'book',
      header: 'Book',
      render: (row) => <StatusChip label={row.book} tone={BOOK_TONE[row.book]} />,
    },
    {
      key: 'expectedDate',
      header: 'Due by',
      render: (row) => formatDate(row.expectedDate),
    },
    {
      key: 'expectedAmount',
      header: 'Budgeted',
      align: 'right',
      render: (row) => <Box sx={MONEY_SX}>{formatInrExact(row.expectedAmount)}</Box>,
    },
    {
      key: 'spent',
      header: 'Spent',
      align: 'right',
      render: (row) => {
        return (
          <Box sx={{ ...MONEY_SX, fontWeight: row.spent ? 700 : 400, color: row.spent ? 'error.main' : 'text.secondary' }}>
            {row.spent ? formatInrExact(row.spent) : '—'}
          </Box>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusChip label={PAYMENT_STATUS[row.status] || row.status} tone={PAYMENT_STATUS_TONE[row.status]} />,
    },
    {
      key: 'remaining',
      header: 'Remaining',
      align: 'right',
      render: (row) => {
        if (row.remaining < 0) {
          return (
            <Box sx={{ ...MONEY_SX, color: 'error.main', fontWeight: 600 }}>
              −{formatInrExact(-row.remaining)}
              <Typography variant="caption" sx={{ display: 'block', fontWeight: 400 }}>over budget</Typography>
            </Box>
          );
        }
        return (
          <Box sx={{ ...MONEY_SX, color: row.remaining ? 'text.primary' : 'text.secondary', fontWeight: row.remaining ? 600 : 400 }}>
            {row.remaining ? formatInrExact(row.remaining) : '—'}
          </Box>
        );
      },
    },
  ];

  const fyOptions = fyMaster.options.map((o) => o.label);

  return (
    <Box sx={{ maxWidth: 1400 }}>
      <PageHeader
        title="Outflow Budget"
        subtitle="Budgeted vs spent for every approved budget line, quarter by quarter. Spending is recorded as Debit Notes."
      />

      <BudgetSummaryCard kpis={kpis} lineCount={rows.length} />

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
        Each row is one quarter of an approved budget line — budget, line, category and book come from the budget.
        Rows appear when a budget is approved. Open a row to see its debit notes.
      </Box>

      <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
        Ageing
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AgeingTile meta={AGEING_META.spent} amount={ageing.spent.amount} count={ageing.spent.count} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AgeingTile meta={AGEING_META.pending} amount={ageing.pending.amount} count={ageing.pending.count} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <AgeingTile meta={AGEING_META.overdue} amount={ageing.overdue.amount} count={ageing.overdue.count} />
        </Grid>
      </Grid>

      <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
        Outflow schedule
      </Typography>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box sx={{ width: { xs: '100%', md: 340 } }}>
          <SearchField placeholder="Search budget, line, programme or category…" value={searchQuery} onChange={setSearchQuery} />
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <Select value={fy} onChange={(e) => setFyChoice(e.target.value)} inputProps={{ 'aria-label': 'Financial year' }}>
              {fyOptions.map((label) => (
                <MenuItem key={label} value={label}>
                  FY {label}{label === fyMaster.activeLabel ? ' (current)' : ''}
                </MenuItem>
              ))}
              <MenuItem value="All">All FYs</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 170 }}>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} inputProps={{ 'aria-label': 'Budget type' }}>
              <MenuItem value="All">All Types</MenuItem>
              {Object.entries(BUDGET_TYPE).map(([code, label]) => (
                <MenuItem key={code} value={code}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select value={bookFilter} onChange={(e) => setBookFilter(e.target.value)} inputProps={{ 'aria-label': 'Book' }}>
              <MenuItem value="All">All Books</MenuItem>
              {Object.keys(BOOK).map((code) => (
                <MenuItem key={code} value={code}>{code}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <DataTable
        columns={columns}
        rows={filteredRows}
        getRowKey={(row) => row.id}
        isLoading={rowsQuery.isPending}
        error={rowsQuery.isError ? rowsQuery.error : null}
        onRetry={rowsQuery.refetch}
        emptyTitle={rows.length ? 'No outflow rows match these filters' : 'No approved budgets yet'}
        emptyDescription={
          rows.length
            ? 'Try adjusting your search or filters.'
            : 'Outflow rows appear here once a budget for this year is approved under Budget.'
        }
        onRowClick={(row) => navigate(`/outflow-budget/${row.id}`)}
      />

      <Stack direction="row" spacing={2.5} sx={{ mt: 1.5, px: 0.5, flexWrap: 'wrap', rowGap: 0.75 }}>
        {Object.entries(PAYMENT_STATUS_TONE).map(([status, tone]) => (
          <Stack key={status} direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: `${tone === 'neutral' ? 'text.secondary' : `${tone}.main`}` }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{PAYMENT_STATUS[status]}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
