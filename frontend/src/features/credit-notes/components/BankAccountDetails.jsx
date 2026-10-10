import { Box, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { StatusChip } from '../../../shared/components/index.js';
import { BOOK_TONE } from '../../donation-management/constants.js';
import { useBankDetail } from '../../bank-details/hooks/useBankDetails.js';

const masked = (accountNumber) => (accountNumber ? `****${String(accountNumber).slice(-4)}` : '');

/**
 * The bank account money was received into, read live from the backend
 * (GET /v1/bank-details/{id}) so bank, IFSC, branch and status are current.
 * Pass `record` when the account is already loaded (e.g. the form's list) to
 * skip the fetch. Falls back to the note's saved `fallbackName` when there's
 * no id or the lookup fails.
 */
export function BankAccountDetails({ id, fallbackName, record = null, compact = false }) {
  const hasId = id != null && id !== '';
  const query = useBankDetail(!record && hasId ? id : undefined);
  const account = record || query.data || null;

  if (!account) {
    if (!record && hasId && query.isLoading) {
      return <Typography variant="body2" color="text.secondary">{fallbackName || 'Loading account…'}</Typography>;
    }
    if (!fallbackName) return <Typography variant="body1">—</Typography>;
    return (
      <Box>
        <Typography variant="body1">{fallbackName}</Typography>
        {!record && hasId && query.isError ? (
          <Typography variant="caption" color="text.secondary">Couldn&apos;t load the current bank details — showing the name saved on the note.</Typography>
        ) : null}
      </Box>
    );
  }

  const inactive = account.status && account.status !== 'ACTIVE';
  const title = `${account.bankName}${account.accountNumber ? ` — ${masked(account.accountNumber)}` : ''}`;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
        {compact || !account.id ? (
          <Typography variant="body1" sx={{ fontWeight: 600 }}>{title}</Typography>
        ) : (
          <Link component={RouterLink} to={`/bank-details/${account.id}`} underline="hover" sx={{ fontWeight: 600 }}>
            {title}
          </Link>
        )}
        {account.book ? <StatusChip label={account.book} tone={BOOK_TONE[account.book]} /> : null}
        {inactive ? <StatusChip label={account.statusLabel || 'Inactive'} tone="warning" /> : null}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
        {[account.ifsc ? `IFSC ${account.ifsc}` : '', account.branchName].filter(Boolean).join(' · ') || '—'}
      </Typography>
    </Box>
  );
}
