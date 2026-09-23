import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ConfirmDialog, DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { BOOK } from '../../donation-management/constants.js';
import { useBankDetails, useCreateBankDetail, useBankDetailLifecycle } from '../hooks/useBankDetails.js';

const initialFormState = {
  book: 'LC',
  bankName: '',
  accountNumber: '',
  ifsc: '',
  branchName: '',
  status: 'Active',
};

export function BankDetailsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [bookFilter, setBookFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [itemToToggle, setItemToToggle] = useState(null);

  // Add Bank Details Modal State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [form, setForm] = useState(initialFormState);

  const bankDetailsQuery = useBankDetails(searchQuery);
  const createBankDetail = useCreateBankDetail();
  const bankDetailLifecycle = useBankDetailLifecycle();

  // Filtered List
  const filteredBankList = useMemo(() => {
    const rows = bankDetailsQuery.data || [];
    const filtered = rows.filter((b) => {
      const matchesBook = bookFilter === 'All' || b.book === bookFilter;
      const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
      return matchesBook && matchesStatus;
    });
    return filtered.map((b, index) => ({ ...b, srNo: index + 1 }));
  }, [bankDetailsQuery.data, bookFilter, statusFilter]);

  // Handle Confirm Status Toggle
  const handleConfirmStatusToggle = () => {
    if (!itemToToggle) return;
    const action = itemToToggle.status === 'ACTIVE' ? 'deactivate' : 'activate';
    bankDetailLifecycle.mutate({ id: itemToToggle.id, action });
    setItemToToggle(null);
  };

  // Handle Add Bank Details Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!form.bankName.trim() || !form.accountNumber.trim() || !form.ifsc.trim() || !form.branchName.trim()) {
      return;
    }

    await createBankDetail.mutateAsync(form);
    setForm(initialFormState);
    setOpenAddDialog(false);
  };

  // Table Columns
  const columns = [
    {
      key: 'srNo',
      header: 'SR NO',
      width: '8%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', pl: 1 }}>
          {row.srNo}
        </Typography>
      ),
    },
    {
      key: 'book',
      header: 'BOOK',
      width: '10%',
      render: (row) => (
        <Box
          sx={{
            display: 'inline-block',
            px: 1.2,
            py: 0.3,
            borderRadius: '4px',
            fontSize: 12,
            fontWeight: 700,
            bgcolor: row.book === 'FC' ? '#EEF2F6' : '#F6F7F8',
            color: row.book === 'FC' ? '#1D4ED8' : '#374151',
            border: '1px solid',
            borderColor: row.book === 'FC' ? '#BFDBFE' : '#E5E7EB',
          }}
        >
          {row.book}
        </Box>
      ),
    },
    {
      key: 'bankName',
      header: 'BANK NAME',
      width: '18%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {row.bankName}
        </Typography>
      ),
    },
    {
      key: 'accountNumber',
      header: 'A/C',
      width: '16%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#17191C' }}>
          {row.accountNumber}
        </Typography>
      ),
    },
    {
      key: 'ifsc',
      header: 'IFSC',
      width: '13%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500, color: 'text.secondary' }}>
          {row.ifsc}
        </Typography>
      ),
    },
    {
      key: 'branchName',
      header: 'BRANCH NAME',
      width: '15%',
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {row.branchName}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '10%',
      render: (row) => (
        <Chip
          label={row.statusLabel}
          color={row.status === 'ACTIVE' ? 'success' : 'error'}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, minWidth: 70 }}
        />
      ),
    },
    {
      key: 'action',
      header: 'ACTION',
      width: '10%',
      render: (row) => (
        <Button
          size="small"
          variant="outlined"
          color={row.status === 'ACTIVE' ? 'warning' : 'success'}
          onClick={() => setItemToToggle(row)}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
        >
          Change Status
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <PageHeader
        title="Bank Details"
        subtitle="Manage statutory bank accounts and domestic/foreign book associations"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenAddDialog(true)}
            sx={{
              bgcolor: '#17191C',
              color: '#FFFFFF',
              fontWeight: 600,
              px: 2.5,
              '&:hover': { bgcolor: '#232629' },
            }}
          >
            Add Bank Details
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box sx={{ width: { xs: '100%', sm: 360 } }}>
          <SearchField
            placeholder="Search bank name, A/C, IFSC, branch…"
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
          />
        </Box>

        <Stack direction="row" spacing={1.5}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <Select
              value={bookFilter}
              onChange={(e) => setBookFilter(e.target.value)}
              displayEmpty
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="All">All Books</MenuItem>
              {Object.keys(BOOK).map((code) => (
                <MenuItem key={code} value={code}>
                  {code} Book
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active Only</MenuItem>
              <MenuItem value="INACTIVE">Inactive Only</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filteredBankList}
        getRowKey={(row) => row.id}
        isLoading={bankDetailsQuery.isPending}
        error={bankDetailsQuery.isError ? bankDetailsQuery.error : null}
        onRetry={bankDetailsQuery.refetch}
        emptyTitle="No bank details found"
        emptyDescription="Try adjusting your search query or filters."
      />

      {/* Add Bank Details Modal Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleAddSubmit}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Add Bank Details
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                {/* Book */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="medium">
                    <TextField
                      select
                      fullWidth
                      label="Book *"
                      value={form.book}
                      onChange={(e) => setForm((prev) => ({ ...prev, book: e.target.value }))}
                    >
                      {Object.entries(BOOK).map(([code, label]) => (
                        <MenuItem key={code} value={code}>
                          {code} · {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                </Grid>

                {/* Status */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="medium">
                    <TextField
                      select
                      fullWidth
                      label="Status *"
                      value={form.status}
                      onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Inactive">Inactive</MenuItem>
                    </TextField>
                  </FormControl>
                </Grid>

                {/* Bank Name */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Bank Name *"
                    placeholder="e.g. HDFC Bank, State Bank of India"
                    value={form.bankName}
                    onChange={(e) => setForm((prev) => ({ ...prev, bankName: e.target.value }))}
                  />
                </Grid>

                {/* Account Number (A/C) */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Account Number (A/C) *"
                    placeholder="e.g. 50200088201412"
                    value={form.accountNumber}
                    onChange={(e) => {
                      const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 18);
                      setForm((prev) => ({ ...prev, accountNumber: numericOnly }));
                    }}
                    inputProps={{ inputMode: 'numeric', maxLength: 18 }}
                  />
                </Grid>

                {/* IFSC Code */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="IFSC Code *"
                    placeholder="e.g. HDFC0000083"
                    value={form.ifsc}
                    onChange={(e) => {
                      const formattedIfsc = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
                      setForm((prev) => ({ ...prev, ifsc: formattedIfsc }));
                    }}
                    inputProps={{ maxLength: 11, style: { textTransform: 'uppercase' } }}
                  />
                </Grid>

                {/* Branch Name */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Branch Name *"
                    placeholder="e.g. GK-1 Branch, New Delhi"
                    value={form.branchName}
                    onChange={(e) => setForm((prev) => ({ ...prev, branchName: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenAddDialog(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                !form.bankName.trim() ||
                !form.accountNumber.trim() ||
                !form.ifsc.trim() ||
                !form.branchName.trim() ||
                createBankDetail.isPending
              }
              sx={{
                bgcolor: '#17191C',
                color: '#FFFFFF',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#232629' },
              }}
            >
              Save Bank Details
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* CONFIRM STATUS TOGGLE DIALOG */}
      <ConfirmDialog
        open={Boolean(itemToToggle)}
        title="Change Bank Account Status"
        description={
          itemToToggle
            ? `Are you sure you want to change the status of "${itemToToggle.bankName} (${itemToToggle.accountNumber})" from ${itemToToggle.statusLabel.toLowerCase()} to ${
                itemToToggle.status === 'ACTIVE' ? 'inactive' : 'active'
              }?`
            : ''
        }
        confirmLabel="Confirm"
        confirmColor={itemToToggle?.status === 'ACTIVE' ? 'warning' : 'primary'}
        onConfirm={handleConfirmStatusToggle}
        onClose={() => setItemToToggle(null)}
      />
    </Box>
  );
}
