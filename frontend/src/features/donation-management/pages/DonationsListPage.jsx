import { useState } from 'react';
import { Box, Button, FormControl, MenuItem, Select, Stack } from '@mui/material';
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

const DONATION_TYPE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All types' },
  { value: 'MAJOR_GIFT', label: 'Major gift' },
  { value: 'RECURRING', label: 'Recurring' },
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'PAYROLL_GIVING', label: 'Payroll giving' },
  { value: 'LEGACY', label: 'Legacy' },
  { value: 'GIK', label: 'Gift in kind' },
  { value: 'CORPUS', label: 'Corpus' },
];

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
      <StatusChip label={row.eightyGStatus === 'ISSUED' ? 'Issued' : row.eightyGLabel?.split(' ')[0] || row.eightyGStatus} tone={EIGHTY_G_STATUS_TONE[row.eightyGStatus] || 'neutral'} />
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
  const [typeFilter, setTypeFilter] = useState('ALL');
  const donationsQuery = useDonations(search ? { search } : {});
  const navigate = useNavigate();

  const rows = (donationsQuery.data || []).filter((row) => {
    if (typeFilter !== 'ALL' && row.donationType !== typeFilter) {
      return false;
    }
    return true;
  });

  return (
    <>
      <PageHeader
        title="Donations"
        subtitle="Gifts received across the organisation"
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button id="tour-new-donation" variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/donations/new')}>
              New donation
            </Button>
          </PermissionGate>
        }
      />
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1, maxWidth: 420 }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search donations, donors, receipt numbers…" />
        </Box>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            displayEmpty
            size="small"
            sx={{ borderRadius: 1.5, bgcolor: 'background.paper' }}
          >
            {DONATION_TYPE_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <DataTable
        columns={columns}
        rows={rows}
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
