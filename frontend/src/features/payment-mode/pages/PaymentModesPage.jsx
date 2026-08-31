import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { usePaymentModes, useCreatePaymentMode, usePaymentModeLifecycle } from '../hooks/usePaymentModes.js';

export function PaymentModesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add Payment Mode Dialog State
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newModeName, setNewModeName] = useState('');
  const [newModeStatus, setNewModeStatus] = useState('Active');

  const paymentModesQuery = usePaymentModes(searchQuery);
  const createPaymentMode = useCreatePaymentMode();
  const paymentModeLifecycle = usePaymentModeLifecycle();

  // Filtered Data
  const filteredPaymentModes = useMemo(() => {
    const modes = paymentModesQuery.data || [];
    const filtered =
      statusFilter === 'All' ? modes : modes.filter((pm) => pm.status === statusFilter);
    return filtered.map((pm, index) => ({ ...pm, srNo: index + 1 }));
  }, [paymentModesQuery.data, statusFilter]);

  // Handle Status Change from Select dropdown
  const handleStatusChange = (id, nextStatus) => {
    const action = nextStatus === 'ACTIVE' ? 'activate' : 'deactivate';
    paymentModeLifecycle.mutate({ id, action });
  };

  // Handle Add New Payment Mode
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newModeName.trim()) return;

    await createPaymentMode.mutateAsync({ name: newModeName, status: newModeStatus });
    setNewModeName('');
    setNewModeStatus('Active');
    setOpenCreateDialog(false);
  };

  // Table Columns
  const columns = [
    {
      key: 'srNo',
      header: 'SR NO',
      width: '20%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', pl: 1 }}>
          {row.srNo}
        </Typography>
      ),
    },
    {
      key: 'name',
      header: 'NAME',
      width: '45%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {row.name}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '35%',
      render: (row) => {
        const isActive = row.status === 'ACTIVE';
        return (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={row.status}
              onChange={(e) => handleStatusChange(row.id, e.target.value)}
              sx={{
                height: 32,
                fontSize: 12.5,
                fontWeight: 700,
                borderRadius: '6px',
                bgcolor: isActive ? '#E6F4EE' : '#F6F7F8',
                color: isActive ? '#0F7B4D' : '#6F747D',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: isActive ? '#B4E2D0' : '#DFE1E5',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isActive ? '#0F7B4D' : '#9BA0A8',
                },
              }}
            >
              <MenuItem value="ACTIVE" sx={{ fontSize: 13, fontWeight: 600, color: '#0F7B4D' }}>
                Active
              </MenuItem>
              <MenuItem value="INACTIVE" sx={{ fontSize: 13, fontWeight: 600, color: '#6F747D' }}>
                Inactive
              </MenuItem>
            </Select>
          </FormControl>
        );
      },
    },
  ];

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <PageHeader
        title="Payment Mode"
        subtitle="Manage supported financial instruments and payment methods"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              bgcolor: '#17191C',
              color: '#FFFFFF',
              fontWeight: 600,
              px: 2.5,
              '&:hover': { bgcolor: '#232629' },
            }}
          >
            Add Payment Mode
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
        <Box sx={{ width: { xs: '100%', sm: 380 } }}>
          <SearchField
            placeholder="Search payment modes…"
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 150 }}>
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

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filteredPaymentModes}
        getRowKey={(row) => row.id}
        isLoading={paymentModesQuery.isPending}
        error={paymentModesQuery.isError ? paymentModesQuery.error : null}
        onRetry={paymentModesQuery.refetch}
        emptyTitle="No payment modes found"
        emptyDescription="Try adjusting your search query or filter."
      />

      {/* Add Payment Mode Modal Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Add Payment Mode
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Payment Mode Name *"
                placeholder="e.g. Wire Transfer, Crypto"
                value={newModeName}
                onChange={(e) => setNewModeName(e.target.value)}
                autoFocus
              />

              <FormControl fullWidth size="medium">
                <TextField
                  select
                  fullWidth
                  label="Status *"
                  value={newModeStatus}
                  onChange={(e) => setNewModeStatus(e.target.value)}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenCreateDialog(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!newModeName.trim() || createPaymentMode.isPending}
              sx={{
                bgcolor: '#17191C',
                color: '#FFFFFF',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#232629' },
              }}
            >
              Save Payment Mode
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
