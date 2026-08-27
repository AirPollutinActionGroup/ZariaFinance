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
import { MOCK_BANK_DETAILS } from '../data/mockBankDetails.js';

export function BankDetailsPage() {
  const [bankList, setBankList] = useState(MOCK_BANK_DETAILS);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookFilter, setBookFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [itemToToggle, setItemToToggle] = useState(null);

  // Add Bank Details Modal State
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newBook, setNewBook] = useState('LC');
  const [newBankName, setNewBankName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newStatus, setNewStatus] = useState('Active');

  // Filtered List
  const filteredBankList = useMemo(() => {
    return bankList.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        b.bankName.toLowerCase().includes(q) ||
        b.accountNumber.toLowerCase().includes(q) ||
        b.ifsc.toLowerCase().includes(q) ||
        b.branchName.toLowerCase().includes(q);
      const matchesBook = bookFilter === 'All' || b.book === bookFilter;
      const matchesStatus =
        statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesBook && matchesStatus;
    });
  }, [bankList, searchQuery, bookFilter, statusFilter]);

  // Handle Confirm Status Toggle
  const handleConfirmStatusToggle = () => {
    if (!itemToToggle) return;
    const nextStatus = itemToToggle.status === 'Active' ? 'Inactive' : 'Active';
    setBankList((prev) =>
      prev.map((b) => (b.id === itemToToggle.id ? { ...b, status: nextStatus } : b))
    );
    setItemToToggle(null);
  };

  // Handle Add Bank Details Submit
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newBankName.trim() || !newAccountNumber.trim() || !newIfsc.trim() || !newBranchName.trim()) {
      return;
    }

    const newEntry = {
      id: `bnk-${Date.now()}`,
      srNo: bankList.length + 1,
      book: newBook,
      bankName: newBankName.trim(),
      accountNumber: newAccountNumber.trim(),
      ifsc: newIfsc.trim().toUpperCase(),
      branchName: newBranchName.trim(),
      status: newStatus,
    };

    setBankList((prev) => [...prev, newEntry]);

    // Reset Form
    setNewBook('LC');
    setNewBankName('');
    setNewAccountNumber('');
    setNewIfsc('');
    setNewBranchName('');
    setNewStatus('Active');
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
          label={row.status}
          color={row.status === 'Active' ? 'success' : 'error'}
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
          color={row.status === 'Active' ? 'warning' : 'success'}
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
              {Object.entries(BOOK).map(([code, label]) => (
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
              <MenuItem value="Active">Active Only</MenuItem>
              <MenuItem value="Inactive">Inactive Only</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filteredBankList}
        getRowKey={(row) => row.id}
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
                      value={newBook}
                      onChange={(e) => setNewBook(e.target.value)}
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
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
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
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                  />
                </Grid>

                {/* Account Number (A/C) */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Account Number (A/C) *"
                    placeholder="e.g. 50200088201412"
                    value={newAccountNumber}
                    onChange={(e) => {
                      const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 18);
                      setNewAccountNumber(numericOnly);
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
                    value={newIfsc}
                    onChange={(e) => {
                      const formattedIfsc = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11);
                      setNewIfsc(formattedIfsc);
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
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
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
                !newBankName.trim() ||
                !newAccountNumber.trim() ||
                !newIfsc.trim() ||
                !newBranchName.trim()
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
            ? `Are you sure you want to change the status of "${itemToToggle.bankName} (${itemToToggle.accountNumber})" from ${itemToToggle.status.toLowerCase()} to ${
                itemToToggle.status === 'Active' ? 'inactive' : 'active'
              }?`
            : ''
        }
        confirmLabel="Confirm"
        confirmColor={itemToToggle?.status === 'Active' ? 'warning' : 'primary'}
        onConfirm={handleConfirmStatusToggle}
        onClose={() => setItemToToggle(null)}
      />
    </Box>
  );
}
