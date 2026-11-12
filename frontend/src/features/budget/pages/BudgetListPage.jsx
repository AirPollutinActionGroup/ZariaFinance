import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TableCell,
  TableFooter,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DataTable, PageHeader, SearchField, StatStrip, StatusChip } from '../../../shared/components/index.js';
import { formatInr, formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { useBudgetFinancialYears, useBudgets } from '../hooks/useBudgets.js';
import { isFinancialYearLabel } from '../lib/financialYear.js';
import {
  BUDGET_STATUS,
  BUDGET_STATUS_TONE,
  BUDGET_TYPE,
  BUDGET_TYPE_TONE,
  CURRENT_FINANCIAL_YEAR,
  budgetTypeOf,
} from '../constants.js';

const MONEY_SX = { fontVariantNumeric: 'tabular-nums' };
/** Workflow order, so sorting by Status reads Draft → Submitted → Approved → Rejected. */
const STATUS_ORDER = { DRAFT: 0, SUBMITTED: 1, APPROVED: 2, REJECTED: 3 };
const sum = (list) => list.reduce((s, b) => s + b.total, 0);
const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** All budgets — /budgets. */
export function BudgetListPage() {
  const navigate = useNavigate();
  const budgetsQuery = useBudgets();
  const budgets = useMemo(() => budgetsQuery.data || [], [budgetsQuery.data]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // The FY lives in the URL (?fy=2026-27 | ?fy=All) so Back from a budget returns to the same year.
  const [searchParams, setSearchParams] = useSearchParams();
  const fyParam = searchParams.get('fy');
  // Years from the Financial Year master; the default is the year running today (master status ACTIVE).
  const fyMaster = useBudgetFinancialYears();
  const defaultFy = fyMaster.activeLabel || CURRENT_FINANCIAL_YEAR;
  const fy = fyParam === 'All' || isFinancialYearLabel(fyParam) ? fyParam : defaultFy;
  const setFy = (value) => setSearchParams({ fy: value }, { replace: true });
  // Every master year (closed ones too, to look back), plus any year a budget uses.
  const fyOptions = [...new Set([...fyMaster.options.map((o) => o.label), ...budgets.map((b) => b.financialYear)])].sort();

  const fyBudgets = useMemo(() => budgets.filter((b) => fy === 'All' || b.financialYear === fy), [budgets, fy]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return fyBudgets.filter((b) => {
      const matchesSearch =
        !q || [b.budgetCode, b.name, b.programme, b.stateName].some((text) => (text || '').toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      const matchesType = typeFilter === 'All' || budgetTypeOf(b) === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [fyBudgets, searchQuery, statusFilter, typeFilter]);

  const filtersActive = Boolean(searchQuery.trim()) || statusFilter !== 'All' || typeFilter !== 'All';
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTypeFilter('All');
  };

  // KPIs describe the whole financial year, independent of the search / type / status filters.
  const kpis = useMemo(() => {
    const where = (pred) => fyBudgets.filter(pred);
    const approved = where((b) => b.status === 'APPROVED');
    const pending = where((b) => b.status === 'SUBMITTED');
    const drafts = where((b) => b.status === 'DRAFT' || b.status === 'REJECTED');
    const programme = where((b) => budgetTypeOf(b) === 'PROGRAMME');
    const organisation = where((b) => budgetTypeOf(b) === 'ORGANISATION');
    return {
      planned: sum(fyBudgets),
      count: fyBudgets.length,
      approved: sum(approved),
      approvedCount: approved.length,
      pending: sum(pending),
      pendingCount: pending.length,
      drafts: sum(drafts),
      draftCount: drafts.length,
      rejectedCount: drafts.filter((b) => b.status === 'REJECTED').length,
      programme: sum(programme),
      organisation: sum(organisation),
    };
  }, [fyBudgets]);

  const columns = [
    {
      key: 'id',
      header: 'Budget',
      sortValue: (b) => b.name,
      render: (b) => (
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{b.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
            {b.budgetCode}{fy === 'All' ? ` · FY ${b.financialYear}` : ''}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'scope',
      header: 'Scope',
      sortValue: (b) => `${budgetTypeOf(b)} ${b.programme}`,
      // Programme on top; type (as a small tinted label) and state underneath.
      render: (b) => (
        <Box sx={{ minWidth: 170 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>{b.programme}</Typography>
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary', mt: 0.25 }}>
            <Box sx={{ '& .MuiChip-root': { height: 18, fontSize: 10.5 } }}>
              <StatusChip
                label={BUDGET_TYPE[budgetTypeOf(b)].replace('-based', '')}
                tone={BUDGET_TYPE_TONE[budgetTypeOf(b)]}
              />
            </Box>
            <PlaceOutlinedIcon sx={{ fontSize: 13 }} />
            <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>{b.stateName || 'All states'}</Typography>
          </Stack>
        </Box>
      ),
    },
    {
      key: 'total',
      header: 'Total budget',
      align: 'right',
      sortValue: (b) => b.total,
      render: (b) => (
        <Box>
          <Typography variant="body2" sx={{ ...MONEY_SX, fontWeight: 700 }}>{formatInrExact(b.total)}</Typography>
          <Typography variant="caption" color="text.secondary">
            {b.lineCount} {b.lineCount === 1 ? 'line' : 'lines'}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (b) => STATUS_ORDER[b.status],
      render: (b) => <StatusChip label={BUDGET_STATUS[b.status]} tone={BUDGET_STATUS_TONE[b.status]} />,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortValue: (b) => b.updatedAt,
      render: (b) => (
        <Box sx={{ whiteSpace: 'nowrap' }}>
          <Typography variant="body2" sx={{ lineHeight: 1.35 }}>{formatDate(b.updatedAt)}</Typography>
          <Typography variant="caption" color="text.secondary">by {b.owner || '—'}</Typography>
        </Box>
      ),
    },
  ];

  const footer =
    filtered.length > 0 ? (
      <TableFooter>
        <TableRow sx={{ '& td': { borderBottom: 'none', bgcolor: 'var(--card2)', color: 'text.primary', fontSize: 13 } }}>
          <TableCell colSpan={2} sx={{ fontWeight: 600 }}>
            Total · {filtered.length} {filtered.length === 1 ? 'budget' : 'budgets'}
          </TableCell>
          <TableCell align="right" sx={{ ...MONEY_SX, fontWeight: 700 }}>
            {formatInrExact(sum(filtered))}
          </TableCell>
          <TableCell colSpan={2} />
        </TableRow>
      </TableFooter>
    ) : null;

  const fyLabel = fy === 'All' ? 'all years' : `FY ${fy}`;

  return (
    <Box sx={{ maxWidth: 1400 }}>
      <PageHeader
        title="Budget"
        subtitle="Plan programme and organisation budgets for each financial year, phase them by quarter, and send them for approval."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/budgets/new?fy=${fy === 'All' ? defaultFy : fy}`)}
          >
            New budget
          </Button>
        }
      />

      <StatStrip
        sx={{ mb: 2 }}
        stats={[
          {
            label: `Total planned · ${fyLabel}`,
            value: formatInr(kpis.planned),
            note: `${kpis.count} ${kpis.count === 1 ? 'budget' : 'budgets'} · Programme ${pct(kpis.programme, kpis.planned)}% · Org ${pct(kpis.organisation, kpis.planned)}%`,
          },
          {
            label: 'Approved',
            value: formatInr(kpis.approved),
            note: `${kpis.approvedCount} ${kpis.approvedCount === 1 ? 'budget' : 'budgets'} · ${pct(kpis.approved, kpis.planned)}% of planned`,
            color: 'success.main',
          },
          {
            label: 'Awaiting approval',
            value: formatInr(kpis.pending),
            note: `${kpis.pendingCount} submitted`,
            color: kpis.pendingCount ? 'warning.main' : undefined,
          },
          {
            label: 'In draft',
            value: formatInr(kpis.drafts),
            note: `${kpis.draftCount} ${kpis.draftCount === 1 ? 'budget' : 'budgets'}${kpis.rejectedCount ? ` · ${kpis.rejectedCount} returned` : ''}`,
          },
        ]}
      />

      <Stack
        direction="row"
        sx={{
          mb: 1.5,
          gap: 1,
          alignItems: 'center',
          flexWrap: 'wrap',
          '& .MuiInputBase-root': { height: 34, fontSize: 13 },
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: 260 }, mr: { sm: 1 } }}>
          <SearchField placeholder="Search budget, programme or state…" value={searchQuery} onChange={setSearchQuery} />
        </Box>
        {[['All', 'All'], ...Object.entries(BUDGET_STATUS)].map(([code, label]) => {
          const selected = statusFilter === code;
          const n = code === 'All' ? fyBudgets.length : fyBudgets.filter((b) => b.status === code).length;
          return (
            <Chip
              key={code}
              size="small"
              label={`${label} · ${n}`}
              onClick={() => setStatusFilter(code)}
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              aria-pressed={selected}
            />
          );
        })}
        {filtersActive ? (
          <Button size="small" onClick={clearFilters} sx={{ textTransform: 'none' }}>
            Clear
          </Button>
        ) : null}
        <Box sx={{ flex: 1 }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select value={fy} onChange={(e) => setFy(e.target.value)} inputProps={{ 'aria-label': 'Financial year' }}>
            {fyOptions.map((option) => (
              <MenuItem key={option} value={option}>
                FY {option}{option === fyMaster.activeLabel ? ' (current)' : ''}
              </MenuItem>
            ))}
            <MenuItem value="All">All FYs</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} inputProps={{ 'aria-label': 'Budget type' }}>
            <MenuItem value="All">All Types</MenuItem>
            {Object.entries(BUDGET_TYPE).map(([code, label]) => (
              <MenuItem key={code} value={code}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <DataTable
        dense
        columns={columns}
        rows={filtered}
        getRowKey={(b) => b.id}
        isLoading={budgetsQuery.isPending}
        error={budgetsQuery.isError ? budgetsQuery.error : null}
        onRetry={budgetsQuery.refetch}
        defaultSort={{ key: 'updatedAt', direction: 'desc' }}
        footer={footer}
        emptyTitle={filtersActive ? 'No budgets match these filters' : `No budgets in ${fyLabel} yet`}
        emptyDescription={filtersActive ? 'Try clearing the filters.' : 'Use “New budget” to plan the first one.'}
        onRowClick={(b) => navigate(`/budgets/${b.id}`)}
      />
    </Box>
  );
}
