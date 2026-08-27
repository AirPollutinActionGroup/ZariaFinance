import { useState, useMemo } from 'react';
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
import { ConfirmDialog, DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { MOCK_PAYMENT_MODES } from '../data/mockPaymentModes.js';

export function PaymentModesPage() {
  const [paymentModes, setPaymentModes] = useState(MOCK_PAYMENT_MODES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [itemToToggle, setItemToToggle] = useState(null);

  // Add Payment Mode Dialog State
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newModeName, setNewModeName] = useState('');
  const [newModeStatus, setNewModeStatus] = useState('Active');

  // Filtered Data
  const filteredPaymentModes = useMemo(() => {
    return paymentModes.filter((pm) => {
      const matchesSearch = pm.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' || pm.status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [paymentModes, searchQuery, statusFilter]);

  // Handle Direct Status Change from Select dropdown
  const handleStatusChange = (id, nextStatus) => {
    setPaymentModes((prev) =>
      prev.map((pm) => (pm.id === id ? { ...pm, status: nextStatus } : pm))
    );
  };

  // Handle Status Toggle via Confirmation Dialog
  const handleConfirmStatusToggle = () => {
    if (!itemToToggle) return;
    const nextStatus = itemToToggle.status === 'Active' ? 'Inactive' : 'Active';
    handleStatusChange(itemToToggle.id, nextStatus);
    setItemToToggle(null);
  };

  // Handle Add New Payment Mode
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newModeName.trim()) return;

    const newMode = {
      id: `pm-${Date.now()}`,
      srNo: paymentModes.length + 1,
      name: newModeName.trim(),
      status: newModeStatus,
    };

    setPaymentModes((prev) => [...prev, newMode]);
    setNewModeName('');
    setNewModeStatus('Active');
    setOpenCreateDialog(false);
  };

  // Table Columns with Shifted Positioning
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
        const isActive = row.status === 'Active';
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
              <MenuItem value="Active" sx={{ fontSize: 13, fontWeight: 600, color: '#0F7B4D' }}>
                Active
              </MenuItem>
              <MenuItem value="Inactive" sx={{ fontSize: 13, fontWeight: 600, color: '#6F747D' }}>
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
            <MenuItem value="Active">Active Only</MenuItem>
            <MenuItem value="Inactive">Inactive Only</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filteredPaymentModes}
        getRowKey={(row) => row.id}
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
              disabled={!newModeName.trim()}
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

      {/* Status Toggle Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(itemToToggle)}
        title={itemToToggle?.status === 'Active' ? 'Deactivate Payment Mode' : 'Activate Payment Mode'}
        description={`Are you sure you want to change the status of "${itemToToggle?.name}" to ${
          itemToToggle?.status === 'Active' ? 'Inactive' : 'Active'
        }?`}
        confirmLabel={itemToToggle?.status === 'Active' ? 'Deactivate' : 'Activate'}
        confirmTone={itemToToggle?.status === 'Active' ? 'warning' : 'primary'}
        onConfirm={handleConfirmStatusToggle}
        onCancel={() => setItemToToggle(null)}
      />
    </Box>
  );
}
