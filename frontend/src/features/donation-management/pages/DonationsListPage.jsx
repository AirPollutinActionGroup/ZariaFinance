import { useState } from 'react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useDonations } from '../hooks/useDonations.js';
import {
  BOOK_TONE,
  EIGHTY_G_STATUS_TONE,
  FUND_MODE_TONE,
  MODULE_ID,
  RECOGNITION_STATUS_TONE,
} from '../constants.js';

const columns = [
  { key: 'donationCode', header: 'Code', width: 150 },
  { key: 'receiptDate', header: 'Date', render: (row) => formatDate(row.receiptDate) },
  { key: 'donorName', header: 'Donor' },
  { key: 'typeLabel', header: 'Type' },
  {
    key: 'amount',
    header: 'Amount',
    align: 'right',
    render: (row) =>
      row.currency && row.currency !== 'INR'
        ? `${row.currency} ${Number(row.amount).toLocaleString('en-IN')}`
        : formatInr(row.amount),
  },
  {
    key: 'fundMode',
    header: 'Fund mode',
    render: (row) => <StatusChip label={row.fundModeLabel} tone={FUND_MODE_TONE[row.fundMode] || 'neutral'} />,
  },
  {
    key: 'book',
    header: 'Book',
    render: (row) => <StatusChip label={row.book} tone={BOOK_TONE[row.book] || 'neutral'} />,
  },
  {
    key: 'eightyGStatus',
    header: '80G',
    render: (row) => (
      <StatusChip label={row.eightyGStatus === 'ISSUED' ? 'Issued' : row.eightyGLabel.split(' ')[0]} tone={EIGHTY_G_STATUS_TONE[row.eightyGStatus] || 'neutral'} />
    ),
  },
  {
    key: 'recognitionStatus',
    header: 'Recognition',
    render: (row) => (
      <StatusChip label={row.recognitionLabel} tone={RECOGNITION_STATUS_TONE[row.recognitionStatus] || 'neutral'} />
    ),
  },
];

/** Donations register — /donations. A donation is income the moment it lands; there is no committed stage. */
export function DonationsListPage() {
  const [search, setSearch] = useState('');
  const donationsQuery = useDonations(search ? { search } : {});
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Donations"
        subtitle="Gifts received across the organisation"
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/donations/new')}>
              New donation
            </Button>
          </PermissionGate>
        }
      />
      <Box sx={{ mb: 2, maxWidth: 420 }}>
        <SearchField value={search} onChange={setSearch} placeholder="Search donations, donors, receipt numbers…" />
      </Box>
      <DataTable
        columns={columns}
        rows={donationsQuery.data || []}
        getRowKey={(row) => row.id}
        isLoading={donationsQuery.isPending}
        error={donationsQuery.isError ? donationsQuery.error : null}
        onRetry={donationsQuery.refetch}
        emptyTitle="No donations"
        emptyDescription="Record a donation to start tracking gifts received."
        onRowClick={(row) => navigate(`/donations/${row.id}`)}
      />
    </>
  );
}
