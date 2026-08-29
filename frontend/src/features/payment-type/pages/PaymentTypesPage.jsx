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
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { MOCK_GROUPS, MOCK_LEDGERS } from '../data/mockPaymentTypes.js';

export function PaymentTypesPage() {
  const [activeTab, setActiveTab] = useState(0);

  // Group State
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const [groupSearch, setGroupSearch] = useState('');
  const [groupStatusFilter, setGroupStatusFilter] = useState('All');
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupStatus, setNewGroupStatus] = useState('Active');

  // Ledger State
  const [ledgers, setLedgers] = useState(MOCK_LEDGERS);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerGroupFilter, setLedgerGroupFilter] = useState('All');
  const [ledgerStatusFilter, setLedgerStatusFilter] = useState('All');
  const [openLedgerDialog, setOpenLedgerDialog] = useState(false);
  const [newLedgerName, setNewLedgerName] = useState('');
  const [newLedgerGroupName, setNewLedgerGroupName] = useState('Balance Sheet');
  const [newLedgerStatus, setNewLedgerStatus] = useState('Active');

  // Filtered Groups
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(groupSearch.toLowerCase());
      const matchesStatus =
        groupStatusFilter === 'All' || g.status.toLowerCase() === groupStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [groups, groupSearch, groupStatusFilter]);

  // Filtered Ledgers
  const filteredLedgers = useMemo(() => {
    return ledgers.filter((l) => {
      const matchesSearch = l.name.toLowerCase().includes(ledgerSearch.toLowerCase());
      const matchesGroup =
        ledgerGroupFilter === 'All' || l.groupName.toLowerCase() === ledgerGroupFilter.toLowerCase();
      const matchesStatus =
        ledgerStatusFilter === 'All' || l.status.toLowerCase() === ledgerStatusFilter.toLowerCase();
      return matchesSearch && matchesGroup && matchesStatus;
    });
  }, [ledgers, ledgerSearch, ledgerGroupFilter, ledgerStatusFilter]);

  // Group Status Change
  const handleGroupStatusChange = (id, nextStatus) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: nextStatus } : g))
    );
  };

  // Ledger Status Change
  const handleLedgerStatusChange = (id, nextStatus) => {
    setLedgers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: nextStatus } : l))
    );
  };

  // Add Group
  const handleAddGroupSubmit = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup = {
      id: `grp-${Date.now()}`,
      srNo: groups.length + 1,
      name: newGroupName.trim(),
      status: newGroupStatus,
    };

    setGroups((prev) => [...prev, newGroup]);
    setNewGroupName('');
    setNewGroupStatus('Active');
    setOpenGroupDialog(false);
  };

  // Add Ledger
  const handleAddLedgerSubmit = (e) => {
    e.preventDefault();
    if (!newLedgerName.trim()) return;

    const newLedger = {
      id: `led-${Date.now()}`,
      srNo: ledgers.length + 1,
      name: newLedgerName.trim(),
      groupName: newLedgerGroupName,
      status: newLedgerStatus,
    };

    setLedgers((prev) => [...prev, newLedger]);
    setNewLedgerName('');
    setNewLedgerStatus('Active');
    setOpenLedgerDialog(false);
  };

  // Group Table Columns
  const groupColumns = [
    {
      key: 'srNo',
      header: 'SR NO',
      width: '15%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', pl: 1 }}>
          {row.srNo}
        </Typography>
      ),
    },
    {
      key: 'name',
      header: 'GROUP NAME',
      width: '55%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {row.name}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '30%',
      render: (row) => {
        const isActive = row.status === 'Active';
        return (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={row.status}
              onChange={(e) => handleGroupStatusChange(row.id, e.target.value)}
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

  // Ledger Table Columns
  const ledgerColumns = [
    {
      key: 'srNo',
      header: 'SR NO',
      width: '12%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', pl: 1 }}>
          {row.srNo}
        </Typography>
      ),
    },
    {
      key: 'name',
      header: 'LEDGER NAME',
      width: '45%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {row.name}
        </Typography>
      ),
    },
    {
      key: 'groupName',
      header: 'GROUP NAME',
      width: '25%',
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {row.groupName}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '18%',
      render: (row) => {
        const isActive = row.status === 'Active';
        return (
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={row.status}
              onChange={(e) => handleLedgerStatusChange(row.id, e.target.value)}
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
        title="Payment Type"
        subtitle="Manage account groups and ledger classification masters"
        actions={
          activeTab === 0 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenGroupDialog(true)}
              sx={{
                bgcolor: '#17191C',
                color: '#FFFFFF',
                fontWeight: 600,
                px: 2.5,
                '&:hover': { bgcolor: '#232629' },
              }}
            >
              Add Group
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenLedgerDialog(true)}
              sx={{
                bgcolor: '#17191C',
                color: '#FFFFFF',
                fontWeight: 600,
                px: 2.5,
                '&:hover': { bgcolor: '#232629' },
              }}
            >
              Add Ledger
            </Button>
          )
        }
      />

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, val) => setActiveTab(val)}
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: 14,
            minHeight: 48,
          },
        }}
      >
        <Tab icon={<AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Group" />
        <Tab icon={<MenuBookOutlinedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Ledger" />
      </Tabs>

      {/* TAB 0: GROUP */}
      {activeTab === 0 && (
        <Stack spacing={3}>
          {/* Group Filter Bar */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
          >
            <Box sx={{ width: { xs: '100%', sm: 380 } }}>
              <SearchField
                placeholder="Search group names…"
                value={groupSearch}
                onChange={(val) => setGroupSearch(val)}
              />
            </Box>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={groupStatusFilter}
                onChange={(e) => setGroupStatusFilter(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Active">Active Only</MenuItem>
                <MenuItem value="Inactive">Inactive Only</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* Group Table */}
          <DataTable
            columns={groupColumns}
            rows={filteredGroups}
            getRowKey={(row) => row.id}
            emptyTitle="No groups found"
            emptyDescription="Try adjusting your search query or filter."
          />
        </Stack>
      )}

      {/* TAB 1: LEDGER */}
      {activeTab === 1 && (
        <Stack spacing={3}>
          {/* Ledger Filter Bar */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
          >
            <Box sx={{ width: { xs: '100%', sm: 340 } }}>
              <SearchField
                placeholder="Search ledger names…"
                value={ledgerSearch}
                onChange={(val) => setLedgerSearch(val)}
              />
            </Box>

            <Stack direction="row" spacing={1.5}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select
                  value={ledgerGroupFilter}
                  onChange={(e) => setLedgerGroupFilter(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="All">All Groups</MenuItem>
                  {groups.map((g) => (
                    <MenuItem key={g.id} value={g.name}>
                      {g.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 140 }}>
                <Select
                  value={ledgerStatusFilter}
                  onChange={(e) => setLedgerStatusFilter(e.target.value)}
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

          {/* Ledger Table */}
          <DataTable
            columns={ledgerColumns}
            rows={filteredLedgers}
            getRowKey={(row) => row.id}
            emptyTitle="No ledgers found"
            emptyDescription="Try adjusting your search query or group filter."
          />
        </Stack>
      )}

      {/* Add Group Modal Dialog */}
      <Dialog
        open={openGroupDialog}
        onClose={() => setOpenGroupDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleAddGroupSubmit}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Add Group
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Group Name *"
                placeholder="e.g. Current Assets, Capital Funds"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                autoFocus
              />

              <FormControl fullWidth size="medium">
                <TextField
                  select
                  fullWidth
                  label="Status *"
                  value={newGroupStatus}
                  onChange={(e) => setNewGroupStatus(e.target.value)}
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
              onClick={() => setOpenGroupDialog(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!newGroupName.trim()}
              sx={{
                bgcolor: '#17191C',
                color: '#FFFFFF',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#232629' },
              }}
            >
              Save Group
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Ledger Modal Dialog */}
      <Dialog
        open={openLedgerDialog}
        onClose={() => setOpenLedgerDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleAddLedgerSubmit}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Add Ledger
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Ledger Name *"
                placeholder="e.g. Water Pipeline Procurement"
                value={newLedgerName}
                onChange={(e) => setNewLedgerName(e.target.value)}
                autoFocus
              />

              <FormControl fullWidth size="medium">
                <TextField
                  select
                  fullWidth
                  label="Group Name *"
                  value={newLedgerGroupName}
                  onChange={(e) => setNewLedgerGroupName(e.target.value)}
                >
                  {groups.map((g) => (
                    <MenuItem key={g.id} value={g.name}>
                      {g.name}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>

              <FormControl fullWidth size="medium">
                <TextField
                  select
                  fullWidth
                  label="Status *"
                  value={newLedgerStatus}
                  onChange={(e) => setNewLedgerStatus(e.target.value)}
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
              onClick={() => setOpenLedgerDialog(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!newLedgerName.trim()}
              sx={{
                bgcolor: '#17191C',
                color: '#FFFFFF',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#232629' },
              }}
            >
              Save Ledger
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
