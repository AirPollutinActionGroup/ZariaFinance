import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ApartmentIcon from '@mui/icons-material/Apartment';
import BadgeIcon from '@mui/icons-material/Badge';
import { ConfirmDialog, DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { MOCK_DEPARTMENTS, MOCK_DESIGNATIONS } from '../data/mockMasters.js';

export function MasterPage() {
  const [activeTab, setActiveTab] = useState(0);

  // Departments State
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [deptSearch, setDeptSearch] = useState('');
  const [deptStatusFilter, setDeptStatusFilter] = useState('All');
  const [deptToToggle, setDeptToToggle] = useState(null);
  const [newDeptOpen, setNewDeptOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptStatus, setNewDeptStatus] = useState('Active');

  // Designations State
  const [designations, setDesignations] = useState(MOCK_DESIGNATIONS);
  const [desigSearch, setDesigSearch] = useState('');
  const [desigStatusFilter, setDesigStatusFilter] = useState('All');
  const [desigToToggle, setDesigToToggle] = useState(null);
  const [newDesigOpen, setNewDesigOpen] = useState(false);
  const [newDesigName, setNewDesigName] = useState('');
  const [newDesigStatus, setNewDesigStatus] = useState('Active');

  // Department Filtered Data
  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch = dept.name.toLowerCase().includes(deptSearch.toLowerCase());
    const matchesStatus =
      deptStatusFilter === 'All' || dept.status.toLowerCase() === deptStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Designation Filtered Data
  const filteredDesignations = designations.filter((desig) => {
    const matchesSearch = desig.name.toLowerCase().includes(desigSearch.toLowerCase());
    const matchesStatus =
      desigStatusFilter === 'All' || desig.status.toLowerCase() === desigStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Department Status Toggle
  const handleConfirmDeptStatusChange = () => {
    if (!deptToToggle) return;
    const nextStatus = deptToToggle.status === 'Active' ? 'Inactive' : 'Active';
    setDepartments((prev) =>
      prev.map((d) => (d.id === deptToToggle.id ? { ...d, status: nextStatus } : d))
    );
    setDeptToToggle(null);
  };

  // Designation Status Toggle
  const handleConfirmDesigStatusChange = () => {
    if (!desigToToggle) return;
    const nextStatus = desigToToggle.status === 'Active' ? 'Inactive' : 'Active';
    setDesignations((prev) =>
      prev.map((d) => (d.id === desigToToggle.id ? { ...d, status: nextStatus } : d))
    );
    setDesigToToggle(null);
  };

  // Add Department
  const handleAddDepartment = (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    const newDept = {
      id: `dept-${Date.now()}`,
      srNo: departments.length + 1,
      name: newDeptName.trim(),
      status: newDeptStatus,
    };
    setDepartments((prev) => [...prev, newDept]);
    setNewDeptName('');
    setNewDeptStatus('Active');
    setNewDeptOpen(false);
  };

  // Add Designation
  const handleAddDesignation = (e) => {
    e.preventDefault();
    if (!newDesigName.trim()) return;
    const newDesig = {
      id: `desig-${Date.now()}`,
      srNo: designations.length + 1,
      name: newDesigName.trim(),
      status: newDesigStatus,
    };
    setDesignations((prev) => [...prev, newDesig]);
    setNewDesigName('');
    setNewDesigStatus('Active');
    setNewDesigOpen(false);
  };

  // Department Columns
  const departmentColumns = [
    {
      key: 'srNo',
      header: 'S.NO',
      width: '15%',
      align: 'center',
      render: (r, idx) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.srNo || idx + 1}
        </Typography>
      ),
    },
    {
      key: 'name',
      header: 'DEPARTMENT NAME',
      width: '45%',
      align: 'center',
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
          {r.name}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '20%',
      align: 'center',
      render: (r) => (
        <Chip
          label={r.status}
          color={r.status === 'Active' ? 'success' : 'error'}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, minWidth: 80 }}
        />
      ),
    },
    {
      key: 'action',
      header: 'ACTION',
      width: '20%',
      align: 'center',
      render: (r) => (
        <Button
          size="small"
          variant="outlined"
          color={r.status === 'Active' ? 'warning' : 'success'}
          onClick={() => setDeptToToggle(r)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Change Status
        </Button>
      ),
    },
  ];

  // Designation Columns
  const designationColumns = [
    {
      key: 'srNo',
      header: 'S.NO',
      width: '15%',
      align: 'center',
      render: (r, idx) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.srNo || idx + 1}
        </Typography>
      ),
    },
    {
      key: 'name',
      header: 'DESIGNATION NAME',
      width: '45%',
      align: 'center',
      render: (r) => <b>{r.name}</b>,
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '20%',
      align: 'center',
      render: (r) => (
        <Chip
          label={r.status}
          color={r.status === 'Active' ? 'success' : 'error'}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, minWidth: 80 }}
        />
      ),
    },
    {
      key: 'action',
      header: 'ACTION',
      width: '20%',
      align: 'center',
      render: (r) => (
        <Button
          size="small"
          variant="outlined"
          color={r.status === 'Active' ? 'warning' : 'success'}
          onClick={() => setDesigToToggle(r)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Change Status
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Master Configuration"
        subtitle="Manage organisational departments, designations and master registers"
        actions={
          activeTab === 0 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewDeptOpen(true)}
            >
              Add Department
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewDesigOpen(true)}
            >
              Add Designation
            </Button>
          )
        }
      />

      {/* TABS */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 14,
              minHeight: 48,
            },
          }}
        >
          <Tab icon={<ApartmentIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Department" />
          <Tab icon={<BadgeIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Designation" />
        </Tabs>
      </Box>

      {/* TAB 1: DEPARTMENT */}
      {activeTab === 0 && (
        <Box>
          <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ maxWidth: 380, flex: 1, minWidth: 240 }}>
              <SearchField
                value={deptSearch}
                onChange={setDeptSearch}
                placeholder="Search department name…"
              />
            </Box>

            <Select
              size="small"
              value={deptStatusFilter}
              onChange={(e) => setDeptStatusFilter(e.target.value)}
              sx={{ minWidth: 140, borderRadius: 2 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </Stack>

          <DataTable
            columns={departmentColumns}
            rows={filteredDepartments}
            getRowKey={(r) => r.id}
            emptyTitle="No departments found"
          />
        </Box>
      )}

      {/* TAB 2: DESIGNATION */}
      {activeTab === 1 && (
        <Box>
          <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ maxWidth: 380, flex: 1, minWidth: 240 }}>
              <SearchField
                value={desigSearch}
                onChange={setDesigSearch}
                placeholder="Search designation name…"
              />
            </Box>

            <Select
              size="small"
              value={desigStatusFilter}
              onChange={(e) => setDesigStatusFilter(e.target.value)}
              sx={{ minWidth: 140, borderRadius: 2 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </Stack>

          <DataTable
            columns={designationColumns}
            rows={filteredDesignations}
            getRowKey={(r) => r.id}
            emptyTitle="No designations found"
          />
        </Box>
      )}

      {/* DIALOG: ADD DEPARTMENT */}
      <Dialog open={newDeptOpen} onClose={() => setNewDeptOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddDepartment}>
          <DialogTitle sx={{ fontWeight: 700 }}>Add New Department</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Department Name"
                placeholder="e.g. DEPT-FINANCE"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <TextField
                select
                label="Status"
                value={newDeptStatus}
                onChange={(e) => setNewDeptStatus(e.target.value)}
                required
                fullWidth
                size="small"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={() => setNewDeptOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Department
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG: ADD DESIGNATION */}
      <Dialog open={newDesigOpen} onClose={() => setNewDesigOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddDesignation}>
          <DialogTitle sx={{ fontWeight: 700 }}>Add New Designation</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Designation Name"
                placeholder="e.g. Senior Financial Analyst"
                value={newDesigName}
                onChange={(e) => setNewDesigName(e.target.value)}
                required
                fullWidth
                size="small"
              />
              <TextField
                select
                label="Status"
                value={newDesigStatus}
                onChange={(e) => setNewDesigStatus(e.target.value)}
                required
                fullWidth
                size="small"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={() => setNewDesigOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Designation
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* CONFIRM STATUS TOGGLE DIALOG - DEPARTMENT */}
      <ConfirmDialog
        open={Boolean(deptToToggle)}
        title="Change Department Status"
        description={
          deptToToggle
            ? `Are you sure you want to change the status of "${deptToToggle.name}" from ${deptToToggle.status.toLowerCase()} to ${
                deptToToggle.status === 'Active' ? 'inactive' : 'active'
              }?`
            : ''
        }
        confirmLabel="Confirm"
        confirmColor={deptToToggle?.status === 'Active' ? 'warning' : 'primary'}
        onConfirm={handleConfirmDeptStatusChange}
        onClose={() => setDeptToToggle(null)}
      />

      {/* CONFIRM STATUS TOGGLE DIALOG - DESIGNATION */}
      <ConfirmDialog
        open={Boolean(desigToToggle)}
        title="Change Designation Status"
        description={
          desigToToggle
            ? `Are you sure you want to change the status of "${desigToToggle.name}" from ${desigToToggle.status.toLowerCase()} to ${
                desigToToggle.status === 'Active' ? 'inactive' : 'active'
              }?`
            : ''
        }
        confirmLabel="Confirm"
        confirmColor={desigToToggle?.status === 'Active' ? 'warning' : 'primary'}
        onConfirm={handleConfirmDesigStatusChange}
        onClose={() => setDesigToToggle(null)}
      />
    </Box>
  );
}
