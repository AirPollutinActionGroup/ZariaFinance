import { useMemo } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { BOOK_TONE } from '../../donation-management/constants.js';
import { useInflowBudgetLine } from '../hooks/useInflowBudget.js';
import { getRowStatus } from '../lib/status.js';
import { FUNDING_SOURCE_TONE, FUNDING_SOURCE_TYPE, RECEIPT_STATUS, RECEIPT_STATUS_TONE } from '../constants.js';

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

  const isReceived = status === RECEIPT_STATUS.RECEIVED;
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
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <StatusChip label={status} tone={RECEIPT_STATUS_TONE[status]} />
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
                <TermRow label="Receipt date">{formatDate(row.actualDate)}</TermRow>
                <TermRow label="Amount received">
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {formatInrExact(row.actualAmount)}
                  </Typography>
                </TermRow>
                {isForeign ? <TermRow label="Actual FX rate">{row.actualFx ?? '—'}</TermRow> : null}
                <TermRow label="Receipt ref / UTR">{row.receiptRef || '—'}</TermRow>
                <TermRow label="Receipt voucher no.">{row.receiptNo || '—'}</TermRow>
                <TermRow label="Outstanding">
                  {outstanding > 0 ? (
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {formatInrExact(outstanding)}
                    </Typography>
                  ) : (
                    '—'
                  )}
                </TermRow>
                <TermRow label="Variance reason" last>
                  {row.varianceReason || '— (matched expected amount)'}
                </TermRow>
              </>
            ) : (
              <Box sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Not yet received. Record the receipt as a Credit transaction against this tranche on the Payment
                  Window (Cr/Dr) page — it will show up here automatically.
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
