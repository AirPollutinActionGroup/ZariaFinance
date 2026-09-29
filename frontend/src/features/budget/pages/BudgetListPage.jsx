import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  Grid,
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
import { DataTable, PageHeader, SearchField, StatCard, StatusChip } from '../../../shared/components/index.js';
import { formatInr, formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { getBudgets } from '../data/budgetRepository.js';
import { budgetTotal } from '../lib/budgetMath.js';
import { isFinancialYearLabel } from '../lib/financialYear.js';
import {
  BUDGET_STATUS,
  BUDGET_STATUS_TONE,
  BUDGET_TYPE,
  BUDGET_TYPE_TONE,
  CURRENT_FINANCIAL_YEAR,
  FINANCIAL_YEARS,
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
  const [budgets] = useState(() => getBudgets().map((b) => ({ ...b, total: budgetTotal(b.lines) })));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // The FY lives in the URL (?fy=2026-27 | ?fy=All) so Back from a budget returns to the same year.
  const [searchParams, setSearchParams] = useSearchParams();
  const fyParam = searchParams.get('fy');
  const fy = fyParam === 'All' || isFinancialYearLabel(fyParam) ? fyParam : CURRENT_FINANCIAL_YEAR;
  const setFy = (value) => setSearchParams({ fy: value }, { replace: true });
  const fyOptions = [...new Set([...FINANCIAL_YEARS, ...budgets.map((b) => b.financialYear)])].sort();

  const fyBudgets = useMemo(() => budgets.filter((b) => fy === 'All' || b.financialYear === fy), [budgets, fy]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return fyBudgets.filter((b) => {
      const matchesSearch =
        !q || [b.id, b.name, b.programme, b.stateName].some((text) => (text || '').toLowerCase().includes(q));
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
            {b.id}{fy === 'All' ? ` · FY ${b.financialYear}` : ''}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'scope',
      header: 'Scope',
      sortValue: (b) => `${budgetTypeOf(b)} ${b.programme}`,
      render: (b) => (
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.4 }}>
            <StatusChip label={BUDGET_TYPE[budgetTypeOf(b)]} tone={BUDGET_TYPE_TONE[budgetTypeOf(b)]} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{b.programme}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.4} alignItems="center" sx={{ color: 'text.secondary' }}>
            <PlaceOutlinedIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption">{b.stateName || 'All states'}</Typography>
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
            {b.lines.length} {b.lines.length === 1 ? 'line' : 'lines'}
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
      key: 'owner',
      header: 'Owner',
      sortValue: (b) => b.owner,
      render: (b) => <Typography variant="body2">{b.owner || '—'}</Typography>,
    },
    {
      key: 'updatedAt',
      header: 'Last updated',
      sortValue: (b) => b.updatedAt,
      render: (b) => <Typography variant="body2" color="text.secondary">{formatDate(b.updatedAt)}</Typography>,
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
          <TableCell colSpan={3} />
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
            onClick={() => navigate(`/budgets/new?fy=${fy === 'All' ? CURRENT_FINANCIAL_YEAR : fy}`)}
          >
            New budget
          </Button>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            emphasis
            label={`Total planned · ${fyLabel}`}
            value={formatInr(kpis.planned)}
            hint={`${kpis.count} ${kpis.count === 1 ? 'budget' : 'budgets'} · Programme ${pct(kpis.programme, kpis.planned)}% · Organisation ${pct(kpis.organisation, kpis.planned)}%`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            accent
            label="Approved"
            value={formatInr(kpis.approved)}
            hint={`${kpis.approvedCount} ${kpis.approvedCount === 1 ? 'budget' : 'budgets'} · ${pct(kpis.approved, kpis.planned)}% of planned`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="Awaiting approval"
            value={formatInr(kpis.pending)}
            hint={`${kpis.pendingCount} submitted`}
            onClick={kpis.pendingCount ? () => setStatusFilter('SUBMITTED') : null}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            label="In draft"
            value={formatInr(kpis.drafts)}
            hint={`${kpis.draftCount} ${kpis.draftCount === 1 ? 'budget' : 'budgets'}${kpis.rejectedCount ? ` · ${kpis.rejectedCount} returned` : ''}`}
            onClick={kpis.draftCount ? () => setStatusFilter('DRAFT') : null}
          />
        </Grid>
      </Grid>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Box sx={{ width: { xs: '100%', md: 360 } }}>
          <SearchField placeholder="Search budget, programme or state…" value={searchQuery} onChange={setSearchQuery} />
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select value={fy} onChange={(e) => setFy(e.target.value)} inputProps={{ 'aria-label': 'Financial year' }}>
              {fyOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  FY {option}{option === CURRENT_FINANCIAL_YEAR ? ' (current)' : ''}
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} inputProps={{ 'aria-label': 'Status' }}>
              <MenuItem value="All">All Statuses</MenuItem>
              {Object.entries(BUDGET_STATUS).map(([code, label]) => (
                <MenuItem key={code} value={code}>{label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, minHeight: 30 }}>
        <Typography variant="body2" color="text.secondary">
          {filtersActive
            ? `Showing ${filtered.length} of ${fyBudgets.length} budgets in ${fyLabel}`
            : `${fyBudgets.length} ${fyBudgets.length === 1 ? 'budget' : 'budgets'} in ${fyLabel}`}
        </Typography>
        {filtersActive ? (
          <Button size="small" onClick={clearFilters} sx={{ textTransform: 'none' }}>
            Clear filters
          </Button>
        ) : null}
      </Stack>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(b) => b.id}
        defaultSort={{ key: 'updatedAt', direction: 'desc' }}
        footer={footer}
        emptyTitle={filtersActive ? 'No budgets match these filters' : `No budgets in ${fyLabel} yet`}
        emptyDescription={filtersActive ? 'Try clearing the filters.' : 'Use “New budget” to plan the first one.'}
        onRowClick={(b) => navigate(`/budgets/${b.id}`)}
      />
    </Box>
  );
}
