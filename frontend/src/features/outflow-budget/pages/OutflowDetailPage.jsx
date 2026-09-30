import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { BOOK_TONE } from '../../donation-management/constants.js';
import { BUDGET_TYPE, BUDGET_TYPE_TONE } from '../../budget/constants.js';
import { useOutflowRow } from '../hooks/useOutflow.js';
import { useDebitNotes } from '../../debit-notes/hooks/useDebitNotes.js';
import { reasonLabel } from '../../debit-notes/constants.js';
import { PAYMENT_STATUS, PAYMENT_STATUS_TONE } from '../constants.js';

const MONEY_SX = { fontVariantNumeric: 'tabular-nums' };

function SectionCard({ title, action, children }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4" component="h2">
            {title}
          </Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

/** Small uppercase label over a value — the budget line facts grid. */
function Fact({ label, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        component="p"
        sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', mb: 0.5 }}
      >
        {label}
      </Typography>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Typography variant="body1">{children}</Typography>
      ) : (
        children
      )}
    </Box>
  );
}

/** Budgeted / Spent / Remaining across the page, with a spend meter that marks the budget line when overspent. */
function SpendingSummary({ row, noteCount }) {
  const budget = Number(row.expectedAmount) || 0;
  const spent = Number(row.spent) || 0;
  const over = row.remaining < 0;
  const scale = Math.max(budget, spent, 1);
  const pctOf = (v) => `${Math.min(100, Math.max(0, (v / scale) * 100))}%`;
  const usedPct = budget > 0 ? Math.round((spent / budget) * 100) : 0;

  const tiles = [
    { label: 'Budgeted', value: formatInrExact(budget), sub: `${row.quarterLabel} · due by ${formatDate(row.expectedDate)}`, accent: 'text.secondary' },
    {
      label: 'Spent',
      value: spent ? formatInrExact(spent) : '—',
      sub: noteCount ? `${noteCount} debit ${noteCount === 1 ? 'note' : 'notes'}` : 'no debit notes yet',
      accent: 'error.main',
      color: spent ? 'error.main' : 'text.secondary',
    },
    {
      label: over ? 'Over budget' : 'Remaining',
      value: formatInrExact(Math.abs(row.remaining)),
      sub: over ? 'spent more than budgeted' : row.remaining === 0 ? 'fully spent' : 'still available on this line',
      accent: over ? 'error.main' : 'success.main',
      color: over ? 'error.main' : 'success.main',
    },
  ];

  return (
    <Card sx={{ mb: 3, overflow: 'hidden' }}>
      <Stack direction={{ xs: 'column', md: 'row' }}>
        {tiles.map((t, i) => (
          <Box
            key={t.label}
            sx={{
              position: 'relative',
              flex: 1,
              p: 2.5,
              pl: 3,
              borderRight: { md: i < tiles.length - 1 ? '1px solid' : 'none' },
              borderBottom: { xs: i < tiles.length - 1 ? '1px solid' : 'none', md: 'none' },
              borderColor: 'divider',
            }}
          >
            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: t.accent }} />
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.09em', color: 'text.secondary', fontWeight: 600 }}>
              {t.label}
            </Typography>
            <Typography sx={{ ...MONEY_SX, fontSize: 26, fontWeight: 700, color: t.color }}>{t.value}</Typography>
            <Typography variant="caption" color="text.secondary">
              {t.sub}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Box sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: over ? 'var(--warn-bg)' : 'var(--card2)' }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
          <Typography variant="caption" color={over ? 'warning.main' : 'text.secondary'}>
            {over ? 'Over budget' : 'Used'}
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: over ? 'error.main' : 'text.primary' }}>
            {usedPct}% of budget
          </Typography>
        </Stack>
        <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: pctOf(spent), bgcolor: 'error.main', borderRadius: 3, transition: 'width .3s ease' }} />
          {over ? <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: pctOf(budget), width: 2, bgcolor: 'text.primary' }} /> : null}
        </Box>
      </Box>
    </Card>
  );
}

/** The debit notes raised against this row. */
function DebitNotesTable({ notes, navigate }) {
  if (!notes.length) {
    return (
      <Box sx={{ py: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Nothing spent yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Raise a Debit Note when money goes out against this line — it adds to Spent here.
        </Typography>
      </Box>
    );
  }

  const total = notes.reduce((sum, n) => sum + (Number(n.amount) || 0), 0);
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ '& th': { color: 'text.secondary', fontWeight: 600, whiteSpace: 'nowrap' } }}>
        <TableHead>
          <TableRow>
            <TableCell>Debit note</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Paid to</TableCell>
            <TableCell>Payment</TableCell>
            <TableCell>Budget</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notes.map((n) => (
            <TableRow key={n.id} hover onClick={() => navigate(`/debit-notes/${n.id}`)} sx={{ cursor: 'pointer' }}>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}>{n.id}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(n.date)}</TableCell>
              <TableCell>
                {n.payee?.name || '—'}
                {n.remarks ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {n.remarks}
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell sx={{ color: 'text.secondary' }}>{[n.paymentMode?.name, n.reference].filter(Boolean).join(' · ') || '—'}</TableCell>
              <TableCell>
                {n.reason ? <StatusChip label={`Over · ${reasonLabel(n.reason)}`} tone="warning" /> : <StatusChip label="Within budget" tone="neutral" />}
              </TableCell>
              <TableCell align="right" sx={{ ...MONEY_SX, fontWeight: 700, color: 'error.main' }}>
                {formatInrExact(n.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow sx={{ '& td': { borderBottom: 'none', bgcolor: 'var(--card2)', color: 'text.primary', fontSize: 13 } }}>
            <TableCell colSpan={5} sx={{ fontWeight: 600 }}>
              Total spent · {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </TableCell>
            <TableCell align="right" sx={{ ...MONEY_SX, fontWeight: 700, color: 'error.main' }}>
              {formatInrExact(total)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

/** One outflow row (a budget line's quarter) — /outflow-budget/:id, e.g. BUD-2026-001-BL01-Q2. */
export function OutflowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const rowQuery = useOutflowRow(id);
  const debitNotesQuery = useDebitNotes();
  const row = rowQuery.data;

  const back = (
    <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/outflow-budget')}>
      Outflow Budget
    </Button>
  );

  if (rowQuery.isPending) return <LoadingState label="Loading outflow row…" />;
  if (rowQuery.isError) {
    return (
      <>
        {back}
        <ErrorState error={rowQuery.error} onRetry={rowQuery.refetch} />
      </>
    );
  }

  const lineNotes = (debitNotesQuery.data || [])
    .filter((n) => n.outflowLineId === row.id)
    .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  const status = row.status;

  return (
    <>
      {back}

      <PageHeader
        eyebrow={`${row.budgetCode} · ${row.lineCode} · ${row.quarterLabel}`}
        title={row.line}
        subtitle={`${row.budgetName} · ${row.scope}`}
        actions={<StatusChip label={PAYMENT_STATUS[status] || status} tone={PAYMENT_STATUS_TONE[status]} />}
      />

      <SpendingSummary row={row} noteCount={lineNotes.length} />

      <SectionCard
        title="Debit notes"
        action={
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => navigate('/debit-notes')}>
              Go to Debit Notes
            </Button>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => navigate(`/debit-notes/new?line=${row.id}`)}>
              Add debit note
            </Button>
          </Stack>
        }
      >
        {debitNotesQuery.isPending ? (
          <Typography variant="body2" color="text.secondary">
            Loading debit notes…
          </Typography>
        ) : debitNotesQuery.isError ? (
          <ErrorState error={debitNotesQuery.error} onRetry={debitNotesQuery.refetch} />
        ) : (
          <DebitNotesTable notes={lineNotes} navigate={navigate} />
        )}
      </SectionCard>

      <SectionCard
        title="Budget line"
        action={
          <Button size="small" onClick={() => navigate(`/budgets/${row.budgetId}`)}>
            Open budget
          </Button>
        }
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
            gap: 3,
          }}
        >
          <Box sx={{ gridColumn: 'span 2' }}>
            <Fact label="Budget">{`${row.budgetCode} — ${row.budgetName}`}</Fact>
          </Box>
          <Box sx={{ gridColumn: 'span 2' }}>
            <Fact label="Line">{`${row.lineCode} — ${row.line}`}</Fact>
          </Box>
          <Fact label="Category">{row.categoryName || '—'}</Fact>
          <Fact label="Scope">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
              <StatusChip label={BUDGET_TYPE[row.budgetType]} tone={BUDGET_TYPE_TONE[row.budgetType]} />
              <Typography variant="body1">{row.scope}</Typography>
            </Stack>
          </Fact>
          <Fact label="State">{row.stateName || 'All states'}</Fact>
          <Fact label="Book">
            <StatusChip label={row.book} tone={BOOK_TONE[row.book]} />
          </Fact>
          <Fact label="Quarter">{`${row.quarterLabel} · FY ${row.financialYear}`}</Fact>
          <Fact label="Due by">{formatDate(row.expectedDate)}</Fact>
        </Box>
      </SectionCard>
    </>
  );
}
