import { useMemo } from 'react';
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
import { ErrorState, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { BOOK_TONE } from '../../donation-management/constants.js';
import { useInflowBudgetLine } from '../hooks/useInflowBudget.js';
import { getRowStatus } from '../lib/status.js';
import { FUNDING_SOURCE_TONE, FUNDING_SOURCE_TYPE, RECEIPT_STATUS, RECEIPT_STATUS_TONE } from '../constants.js';

const MONEY_SX = { fontVariantNumeric: 'tabular-nums' };

/** RECEIPT_STATUS values are labels ('Received'); the tone map is keyed by the constant name. */
const toneOf = (status) => RECEIPT_STATUS_TONE[Object.keys(RECEIPT_STATUS).find((k) => RECEIPT_STATUS[k] === status)];

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

/** Expected / Received / Outstanding across the page, with a collection meter. */
function ReceiptSummary({ row, outstanding }) {
  const expected = Number(row.expectedAmount) || 0;
  const received = Number(row.actualAmount) || 0;
  const pct = expected > 0 ? Math.min(100, Math.round((received / expected) * 100)) : 0;
  const tiles = [
    { label: 'Expected', value: formatInrExact(expected), sub: `due ${formatDate(row.expectedDate)}`, accent: 'text.secondary' },
    {
      label: 'Received',
      value: formatInrExact(received),
      sub: row.actualDate ? `last on ${formatDate(row.actualDate)}` : 'nothing yet',
      accent: 'success.main',
      color: received ? 'success.main' : 'text.secondary',
    },
    {
      label: 'Outstanding',
      value: outstanding > 0 ? formatInrExact(outstanding) : '—',
      sub: outstanding > 0 ? 'still to come from the donor' : outstanding < 0 ? `${formatInrExact(-outstanding)} more than expected` : 'fully received',
      accent: outstanding > 0 ? 'warning.main' : 'success.main',
      color: outstanding > 0 ? 'warning.main' : 'text.secondary',
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
      <Box sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'var(--card2)' }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
          <Typography variant="caption" color="text.secondary">
            Collected
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {pct}% of expected
          </Typography>
        </Stack>
        <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: 'success.main', borderRadius: 3, transition: 'width .3s ease' }} />
        </Box>
      </Box>
    </Card>
  );
}

/** Each instalment received on the line — the credit notes raised against its tranche. */
function ReceiptsTable({ row, navigate }) {
  const receipts = row.receipts || [];
  if (!receipts.length) {
    return (
      <Box sx={{ py: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Nothing received yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Raise a Credit Note against this tranche when the donor&apos;s money comes in — it shows up here automatically.
        </Typography>
      </Box>
    );
  }

  const total = receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ '& th': { color: 'text.secondary', fontWeight: 600, whiteSpace: 'nowrap' } }}>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Date received</TableCell>
            <TableCell>Credit note</TableCell>
            <TableCell>Receipt ref / UTR</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {receipts.map((r, i) => (
            <TableRow key={r.creditNoteId} hover onClick={() => navigate(`/credit-notes/${r.creditNoteId}`)} sx={{ cursor: 'pointer' }}>
              <TableCell sx={{ color: 'text.secondary' }}>{i + 1}</TableCell>
              <TableCell>{formatDate(r.date)}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>{r.creditNoteId}</TableCell>
              <TableCell>{r.reference || '—'}</TableCell>
              <TableCell align="right" sx={{ ...MONEY_SX, fontWeight: 700, color: 'success.main' }}>
                {formatInrExact(r.amount)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow sx={{ '& td': { borderBottom: 'none', bgcolor: 'var(--card2)', color: 'text.primary', fontSize: 13 } }}>
            <TableCell colSpan={4} sx={{ fontWeight: 600 }}>
              Total received · {receipts.length} {receipts.length === 1 ? 'instalment' : 'instalments'}
            </TableCell>
            <TableCell align="right" sx={{ ...MONEY_SX, fontWeight: 700, color: 'success.main' }}>
              {formatInrExact(total)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

/** Single budget line / donor receipt view — /inflow-budget/:id. */
export function InflowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const lineQuery = useInflowBudgetLine(id);
  const row = lineQuery.data;

  const asAt = useMemo(() => new Date(), []);
  const status = row ? getRowStatus(row, asAt) : null;

  if (lineQuery.isPending) {
    return (
      <Typography variant="body2" color="text.secondary">
        Loading budget line…
      </Typography>
    );
  }

  if (lineQuery.isError || !row) {
    return (
      <>
        <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/inflow-budget')}>
          Inflow Budget
        </Button>
        <ErrorState error={lineQuery.error || { message: `No budget line found for "${id}".` }} onRetry={lineQuery.refetch} />
      </>
    );
  }

  const isForeign = row.book === 'FC';
  const outstanding = Number(row.expectedAmount) - Number(row.actualAmount || 0);

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/inflow-budget')}>
        Inflow Budget
      </Button>

      <PageHeader
        title={row.id}
        subtitle={row.line}
        actions={<StatusChip label={status} tone={toneOf(status)} />}
      />

      <ReceiptSummary row={row} outstanding={outstanding} />

      <SectionCard
        title="Receipts"
        action={
          outstanding > 0 ? (
            <Button variant="outlined" color="success" size="small" startIcon={<AddIcon />} onClick={() => navigate('/credit-notes/new')}>
              New credit note
            </Button>
          ) : null
        }
      >
        <ReceiptsTable row={row} navigate={navigate} />
      </SectionCard>

      <SectionCard title="Budget line">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
            gap: 3,
          }}
        >
          <Box sx={{ gridColumn: { xs: 'span 2', md: 'span 2' } }}>
            <Fact label="Line">{row.line}</Fact>
          </Box>
          <Fact label="Donor / grant">{row.donor || '—'}</Fact>
          <Fact label="Funding source">
            <StatusChip label={FUNDING_SOURCE_TYPE[row.fundingSource]} tone={FUNDING_SOURCE_TONE[row.fundingSource]} />
          </Fact>
          <Fact label="Book">
            <StatusChip label={row.book} tone={BOOK_TONE[row.book]} />
          </Fact>
          <Fact label="Expected date">{formatDate(row.expectedDate)}</Fact>
          <Fact label="Expected amount">{formatInrExact(row.expectedAmount)}</Fact>
          <Fact label="Expected FX rate">{isForeign ? row.expectedFx ?? '—' : 'N/A (LC)'}</Fact>
        </Box>
      </SectionCard>
    </>
  );
}
