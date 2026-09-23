import { useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { BOOK_TONE } from '../../donation-management/constants.js';
import { getOutflowRowById, recordOutflowPayment } from '../data/outflowRepository.js';
import { RecordPaymentDialog } from '../components/RecordPaymentDialog.jsx';
import { getRowStatus } from '../lib/status.js';
import { AS_AT_DATE, FUNDING_SOURCE_TONE, FUNDING_SOURCE_TYPE, PAYMENT_STATUS, PAYMENT_STATUS_TONE } from '../constants.js';

/** Label/value row in the "register" style used across donor & grant detail pages. */
function TermRow({ label, children, last = false }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ py: 1.75, alignItems: 'center', borderBottom: last ? 'none' : '1px solid', borderColor: 'divider' }}
    >
      <Typography
        variant="caption"
        sx={{ width: { xs: 140, sm: 190 }, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}
      >
        {label}
      </Typography>
      <Box sx={{ minWidth: 0 }}>
        {typeof children === 'string' || typeof children === 'number' ? (
          <Typography variant="body1">{children}</Typography>
        ) : (
          children
        )}
      </Box>
    </Stack>
  );
}

function SectionCard({ title, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

/** Single budget line / vendor payment view — /outflow-budget/:id. */
export function OutflowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState(() => getOutflowRowById(id));
  const [dialogOpen, setDialogOpen] = useState(false);

  const asAt = useMemo(() => new Date(AS_AT_DATE), []);
  const status = row ? getRowStatus(row, asAt) : null;

  if (!row) {
    return (
      <>
        <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/outflow-budget')}>
          Outflow Budget
        </Button>
        <ErrorState error={{ message: `No budget line found for "${id}".` }} />
      </>
    );
  }

  const isPaid = status === PAYMENT_STATUS.PAID;
  const isForeign = row.book === 'FC';

  const handleSavePayment = (patch) => {
    const updated = recordOutflowPayment(row.id, patch);
    setRow(updated.find((r) => r.id === row.id));
    setDialogOpen(false);
  };

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/outflow-budget')}>
        Outflow Budget
      </Button>

      <PageHeader
        title={row.id}
        subtitle={row.line}
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <StatusChip label={status} tone={PAYMENT_STATUS_TONE[status]} />
            {!isPaid ? (
              <Button variant="contained" onClick={() => setDialogOpen(true)}>
                Record payment
              </Button>
            ) : null}
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Budget line">
            <TermRow label="Line">{row.line}</TermRow>
            <TermRow label="Funding source">
              <StatusChip label={FUNDING_SOURCE_TYPE[row.fundingSource]} tone={FUNDING_SOURCE_TONE[row.fundingSource]} />
            </TermRow>
            {row.donor ? <TermRow label="Donor / grant">{row.donor}</TermRow> : null}
            <TermRow label="Book">
              <StatusChip label={row.book} tone={BOOK_TONE[row.book]} />
            </TermRow>
            <TermRow label="Expected date">{formatDate(row.expectedDate)}</TermRow>
            <TermRow label="Budgeted amount">{formatInrExact(row.expectedAmount)}</TermRow>
            <TermRow label="Expected FX rate" last={!isForeign}>
              {isForeign ? row.expectedFx ?? '—' : 'N/A (LC)'}
            </TermRow>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Payment">
            {isPaid ? (
              <>
                <TermRow label="Payment date">{formatDate(row.actualDate)}</TermRow>
                <TermRow label="Amount paid">
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {formatInrExact(row.actualAmount)}
                  </Typography>
                </TermRow>
                {isForeign ? <TermRow label="Actual FX rate">{row.actualFx ?? '—'}</TermRow> : null}
                <TermRow label="Payment ref / UTR">{row.paymentRef || '—'}</TermRow>
                <TermRow label="Payment voucher no.">{row.voucherNo || '—'}</TermRow>
                <TermRow label="Variance reason" last>
                  {row.varianceReason || '— (matched budgeted amount)'}
                </TermRow>
              </>
            ) : (
              <Box sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Not yet paid. Once the payment goes out, record the payment date, amount and reference here —
                  everything else on this line is already inherited from the approved budget.
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Keyed on open state so each open remounts with a fresh, correctly pre-filled form. */}
      <RecordPaymentDialog
        key={dialogOpen ? row.id : 'closed'}
        row={dialogOpen ? row : null}
        onClose={() => setDialogOpen(false)}
        onSave={handleSavePayment}
      />
    </>
  );
}
