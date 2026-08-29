import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import { PageHeader } from '../../../shared/components/index.js';
import { formatInr } from '../../../lib/format/currency.js';
import { BOOKS, MOCK_TRANSACTIONS } from '../data/mockNewTransaction.js';

function DetailField({ label, value, chip = null }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Typography
        variant="caption"
        component="p"
        color="text.secondary"
        sx={{ fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}
      >
        {label}
      </Typography>
      {chip || (
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || '—'}
        </Typography>
      )}
    </Grid>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
      {children}
    </Typography>
  );
}

export function NewTransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const tx = MOCK_TRANSACTIONS.find((t) => t.id === id) || MOCK_TRANSACTIONS[0];
  const isDebit = tx.type === 'DEBIT';
  const bookLabel = BOOKS.find((b) => b.value === tx.book)?.label || tx.book;

  return (
    <Box>
      <PageHeader
        title={tx.id}
        subtitle={`${tx.date} · ${bookLabel}`}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/new-transaction')}
          >
            Back to List
          </Button>
        }
      />

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
            <Avatar sx={{ bgcolor: isDebit ? 'error.main' : 'success.main', width: 48, height: 48 }}>
              <ReceiptOutlinedIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box flex={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {tx.partyName}
                </Typography>
                <Chip
                  label={isDebit ? 'Debit (Out)' : 'Credit (In)'}
                  color={isDebit ? 'error' : 'success'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {tx.groupLabel}
              </Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: isDebit ? 'error.main' : 'success.main' }}
            >
              {isDebit ? '−' : '+'}
              {formatInr(tx.amount)}
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />

          <SectionTitle>Transaction Basics</SectionTitle>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <DetailField label="Transaction ID" value={tx.id} />
            <DetailField label="Type" value={isDebit ? 'Debit (Out)' : 'Credit (In)'} />
            <DetailField label="Book" value={bookLabel} />
            <DetailField label="Date" value={tx.date} />
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <SectionTitle>Party</SectionTitle>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <DetailField label={isDebit ? 'Payee' : 'Donor'} value={tx.partyName} />
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <SectionTitle>Fund &amp; Grant</SectionTitle>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <DetailField label="Donor" value={tx.donorName} />
            <DetailField label="Fund Profile" value={tx.fundName} />
            <DetailField label="Grant Agreement" value={tx.grantId} />
            <DetailField
              label="Amount"
              chip={
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 700, color: isDebit ? 'error.main' : 'success.main' }}
                >
                  {isDebit ? '−' : '+'}
                  {formatInr(tx.amount)}
                </Typography>
              }
            />
            <DetailField label="Bank Account" value={tx.bankAccountLabel} />
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <SectionTitle>Payment Details</SectionTitle>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <DetailField label="Payment Mode" value={tx.paymentModeLabel} />
            <DetailField label="Reference No." value={tx.reference} />
            <DetailField label="Group" value={tx.groupLabel} />
            <DetailField label="Ledger / Payment Type" value={tx.ledgerLabel} />
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <SectionTitle>Notes</SectionTitle>
          <Grid container spacing={3}>
            <DetailField label="Note / Remarks" value={tx.notes} />
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
