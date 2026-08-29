import { useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { BOOK_TONE } from '../../donation-management/constants.js';
import { getInflowRowById, recordInflowReceipt } from '../data/inflowRepository.js';
import { RecordReceiptDialog } from '../components/RecordReceiptDialog.jsx';
import { getRowStatus } from '../lib/status.js';
import { AS_AT_DATE, RECEIPT_STATUS, RECEIPT_STATUS_TONE, RESTRICTION_TONE, RESTRICTION_TYPE } from '../constants.js';

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

/** Single tranche / donation view — /inflow-budget/:id. */
export function InflowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [row, setRow] = useState(() => getInflowRowById(id));
  const [dialogOpen, setDialogOpen] = useState(false);

  const asAt = useMemo(() => new Date(AS_AT_DATE), []);
  const status = row ? getRowStatus(row, asAt) : null;

  if (!row) {
    return (
      <>
        <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/inflow-budget')}>
          Inflow Budget
        </Button>
        <ErrorState error={{ message: `No tranche or donation found for "${id}".` }} />
      </>
    );
  }

  const isReceived = status === RECEIPT_STATUS.RECEIVED;
  const isForeign = row.book === 'FC';

  const handleSaveReceipt = (patch) => {
    const updated = recordInflowReceipt(row.id, patch);
    setRow(updated.find((r) => r.id === row.id));
    setDialogOpen(false);
  };

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/inflow-budget')}>
        Inflow Budget
      </Button>

      <PageHeader
        title={row.id}
        subtitle={row.donor}
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <StatusChip label={status} tone={RECEIPT_STATUS_TONE[status]} />
            {!isReceived ? (
              <Button variant="contained" onClick={() => setDialogOpen(true)}>
                Record receipt
              </Button>
            ) : null}
          </Stack>
        }
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Schedule">
            <TermRow label="Donor">{row.donor}</TermRow>
            <TermRow label="Restriction">
              <StatusChip label={RESTRICTION_TYPE[row.restriction]} tone={RESTRICTION_TONE[row.restriction]} />
            </TermRow>
            <TermRow label="Book">
              <StatusChip label={row.book} tone={BOOK_TONE[row.book]} />
            </TermRow>
            <TermRow label="Expected date">{formatDate(row.expectedDate)}</TermRow>
            <TermRow label="Expected amount">{formatInrExact(row.expectedAmount)}</TermRow>
            <TermRow label="Expected FX rate" last={!isForeign}>
              {isForeign ? row.expectedFx ?? '—' : 'N/A (LC)'}
            </TermRow>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Receipt">
            {isReceived ? (
              <>
                <TermRow label="Actual date">{formatDate(row.actualDate)}</TermRow>
                <TermRow label="Actual amount">
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {formatInrExact(row.actualAmount)}
                  </Typography>
                </TermRow>
                {isForeign ? <TermRow label="Actual FX rate">{row.actualFx ?? '—'}</TermRow> : null}
                <TermRow label="Bank reference / UTR">{row.bankRef || '—'}</TermRow>
                <TermRow label="Receipt voucher no.">{row.voucherNo || '—'}</TermRow>
                <TermRow label="Variance reason" last>
                  {row.varianceReason || '— (matched expected amount)'}
                </TermRow>
              </>
            ) : (
              <Box sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Not yet received. Once the money lands, record the actual date, amount and bank reference here —
                  everything else on this tranche is already inherited from the donor module.
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      {/* Keyed on open state so each open remounts with a fresh, correctly pre-filled form. */}
      <RecordReceiptDialog
        key={dialogOpen ? row.id : 'closed'}
        row={dialogOpen ? row : null}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveReceipt}
      />
    </>
  );
}
