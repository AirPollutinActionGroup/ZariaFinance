import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
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
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { ConfirmDialog, DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { useCreateDepartment, useDepartmentLifecycle, useDepartments } from '../hooks/useDepartments.js';
import { useCreateDesignation, useDesignationLifecycle, useDesignations } from '../hooks/useDesignations.js';
import { useCreateDonorType, useDonorTypeLifecycle, useDonorTypes } from '../hooks/useDonorTypes.js';

export function MasterPage() {
  const [activeTab, setActiveTab] = useState(0);

  // Departments State
  const [deptSearch, setDeptSearch] = useState('');
  const [deptStatusFilter, setDeptStatusFilter] = useState('All');
  const [deptToToggle, setDeptToToggle] = useState(null);
  const [newDeptOpen, setNewDeptOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptStatus, setNewDeptStatus] = useState('Active');

  // Designations State
  const [desigSearch, setDesigSearch] = useState('');
  const [desigStatusFilter, setDesigStatusFilter] = useState('All');
  const [desigToToggle, setDesigToToggle] = useState(null);
  const [newDesigOpen, setNewDesigOpen] = useState(false);
  const [newDesigName, setNewDesigName] = useState('');
  const [newDesigDepartmentId, setNewDesigDepartmentId] = useState('');
  const [newDesigStatus, setNewDesigStatus] = useState('Active');

  const departmentsQuery = useDepartments(deptSearch);
  const createDepartment = useCreateDepartment();
  const departmentLifecycle = useDepartmentLifecycle();

  // Full, unfiltered department list — feeds the "Department Name" dropdown
  // on the Add Designation dialog, independent of the Department tab's search.
  const allDepartmentsQuery = useDepartments();

  const designationsQuery = useDesignations(desigSearch);
  const createDesignation = useCreateDesignation();
  const designationLifecycle = useDesignationLifecycle();

  // Donor Types State
  const [donorTypeSearch, setDonorTypeSearch] = useState('');
  const [donorTypeStatusFilter, setDonorTypeStatusFilter] = useState('All');
  const [donorTypeToToggle, setDonorTypeToToggle] = useState(null);
  const [newDonorTypeOpen, setNewDonorTypeOpen] = useState(false);
  const [newDonorTypeName, setNewDonorTypeName] = useState('');
  const [newDonorTypeStatus, setNewDonorTypeStatus] = useState('Active');
  const [newDonorTypeFundSourceDomiciles, setNewDonorTypeFundSourceDomiciles] = useState([]);
  const [newDonorTypeContributionTypes, setNewDonorTypeContributionTypes] = useState([]);

  const donorTypesQuery = useDonorTypes(donorTypeSearch);
  const createDonorType = useCreateDonorType();
  const donorTypeLifecycle = useDonorTypeLifecycle();

  // Defaults the Add Designation dialog's department to the first one loaded,
  // until the user picks a different one — computed, not stored, to avoid a
  // setState-in-effect render cascade.
  const selectedDesigDepartmentId = newDesigDepartmentId || allDepartmentsQuery.data?.[0]?.id || '';

  // Department Filtered Data
  const filteredDepartments = useMemo(() => {
    const rows = departmentsQuery.data || [];
    const filtered = deptStatusFilter === 'All' ? rows : rows.filter((d) => d.status === deptStatusFilter);
    return filtered.map((d, index) => ({ ...d, srNo: index + 1 }));
  }, [departmentsQuery.data, deptStatusFilter]);

  // Designation Filtered Data
  const filteredDesignations = useMemo(() => {
    const rows = designationsQuery.data || [];
    const filtered = desigStatusFilter === 'All' ? rows : rows.filter((d) => d.status === desigStatusFilter);
    return filtered.map((d, index) => ({ ...d, srNo: index + 1 }));
  }, [designationsQuery.data, desigStatusFilter]);

  // Donor Type Filtered Data
  const filteredDonorTypes = useMemo(() => {
    const rows = donorTypesQuery.data || [];
    const filtered = donorTypeStatusFilter === 'All' ? rows : rows.filter((d) => d.status === donorTypeStatusFilter);
    return filtered.map((d, index) => ({ ...d, srNo: index + 1 }));
  }, [donorTypesQuery.data, donorTypeStatusFilter]);

  // Department Status Toggle
  const handleConfirmDeptStatusChange = async () => {
    if (!deptToToggle) return;
    const action = deptToToggle.status === 'ACTIVE' ? 'deactivate' : 'activate';
    await departmentLifecycle.mutateAsync({ id: deptToToggle.id, action });
    setDeptToToggle(null);
  };

  // Designation Status Toggle
  const handleConfirmDesigStatusChange = async () => {
    if (!desigToToggle) return;
    const action = desigToToggle.status === 'ACTIVE' ? 'deactivate' : 'activate';
    await designationLifecycle.mutateAsync({ id: desigToToggle.id, action });
    setDesigToToggle(null);
  };

  // Donor Type Status Toggle
  const handleConfirmDonorTypeStatusChange = async () => {
    if (!donorTypeToToggle) return;
    const action = donorTypeToToggle.status === 'ACTIVE' ? 'deactivate' : 'activate';
    await donorTypeLifecycle.mutateAsync({ id: donorTypeToToggle.id, action });
    setDonorTypeToToggle(null);
  };

  // Add Department
  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    await createDepartment.mutateAsync({ name: newDeptName, status: newDeptStatus });
    setNewDeptName('');
    setNewDeptStatus('Active');
    setNewDeptOpen(false);
  };

  // Add Designation
  const handleAddDesignation = async (e) => {
    e.preventDefault();
    if (!newDesigName.trim() || !selectedDesigDepartmentId) return;
    await createDesignation.mutateAsync({
      name: newDesigName,
      departmentId: selectedDesigDepartmentId,
      status: newDesigStatus,
    });
    setNewDesigName('');
    setNewDesigDepartmentId('');
    setNewDesigStatus('Active');
    setNewDesigOpen(false);
  };

  // Add Donor Type
  const handleAddDonorType = async (e) => {
    e.preventDefault();
    if (!newDonorTypeName.trim()) return;
    await createDonorType.mutateAsync({
      name: newDonorTypeName,
      status: newDonorTypeStatus,
      allowedFundSourceDomiciles: newDonorTypeFundSourceDomiciles,
      allowedContributionTypes: newDonorTypeContributionTypes,
    });
    setNewDonorTypeName('');
    setNewDonorTypeStatus('Active');
    setNewDonorTypeFundSourceDomiciles([]);
    setNewDonorTypeContributionTypes([]);
    setNewDonorTypeOpen(false);
  };

  // Department Columns
  const departmentColumns = [
    {
      key: 'srNo',
      header: 'S.NO',
      width: '15%',
      align: 'center',
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.srNo}
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
          label={r.statusLabel}
          color={r.status === 'ACTIVE' ? 'success' : 'error'}
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
          color={r.status === 'ACTIVE' ? 'warning' : 'success'}
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
      width: '10%',
      align: 'center',
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.srNo}
        </Typography>
      ),
    },
    {
      key: 'name',
      header: 'DESIGNATION NAME',
      width: '35%',
      align: 'center',
      render: (r) => <b>{r.name}</b>,
    },
    {
      key: 'departmentName',
      header: 'DEPARTMENT NAME',
      width: '25%',
      align: 'center',
      render: (r) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontWeight: 600 }}>
          {r.departmentName || '—'}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '15%',
      align: 'center',
      render: (r) => (
        <Chip
          label={r.statusLabel}
          color={r.status === 'ACTIVE' ? 'success' : 'error'}
          size="small"
          variant="outlined"
          sx={{ fontWeight: 600, minWidth: 80 }}
        />
      ),
    },
    {
      key: 'action',
      header: 'ACTION',
      width: '15%',
      align: 'center',
      render: (r) => (
        <Button
          size="small"
          variant="outlined"
          color={r.status === 'ACTIVE' ? 'warning' : 'success'}
          onClick={() => setDesigToToggle(r)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Change Status
        </Button>
      ),
    },
  ];

  // Donor Type Columns
  const donorTypeColumns = [
    {
      key: 'srNo',
      header: 'S.NO',
      width: '10%',
      align: 'center',
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.srNo}
        </Typography>
      ),
    },
    {
      key: 'name',
      header: 'DONOR TYPE NAME',
      width: '25%',
      align: 'center',
      render: (r) => <b>{r.name}</b>,
    },
    {
      key: 'allowedFundSourceDomiciles',
      header: 'FUND SOURCE DOMICILE',
      width: '20%',
      align: 'center',
      render: (r) => (
        <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
          {r.allowedFundSourceDomiciles.length
            ? r.allowedFundSourceDomiciles.map((v) => (
                <Chip key={v} label={v === 'DOMESTIC' ? 'Domestic' : 'Foreign'} size="small" variant="outlined" />
              ))
            : <Typography variant="body2" color="text.secondary">Any</Typography>}
        </Stack>
      ),
    },
    {
      key: 'allowedContributionTypes',
      header: 'CONTRIBUTION TYPE',
      width: '15%',
      align: 'center',
      render: (r) => (
        <Stack direction="row" spacing={0.5} justifyContent="center" flexWrap="wrap">
          {r.allowedContributionTypes.length
            ? r.allowedContributionTypes.map((v) => <Chip key={v} label={v} size="small" variant="outlined" />)
            : <Typography variant="body2" color="text.secondary">Any</Typography>}
        </Stack>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '15%',
      align: 'center',
      render: (r) => (
        <Chip
          label={r.statusLabel}
          color={r.status === 'ACTIVE' ? 'success' : 'error'}
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
          color={r.status === 'ACTIVE' ? 'warning' : 'success'}
          onClick={() => setDonorTypeToToggle(r)}
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
        subtitle="Manage organisational departments, designations, donor types and master registers"
        actions={
          activeTab === 0 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewDeptOpen(true)}
            >
              Add Department
            </Button>
          ) : activeTab === 1 ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewDesigOpen(true)}
            >
              Add Designation
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setNewDonorTypeOpen(true)}
            >
              Add Donor Type
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
          <Tab icon={<VolunteerActivismIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Donor Type" />
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
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </Stack>

          <DataTable
            columns={departmentColumns}
            rows={filteredDepartments}
            getRowKey={(r) => r.id}
            isLoading={departmentsQuery.isPending}
            error={departmentsQuery.isError ? departmentsQuery.error : null}
            onRetry={departmentsQuery.refetch}
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
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </Stack>

          <DataTable
            columns={designationColumns}
            rows={filteredDesignations}
            getRowKey={(r) => r.id}
            isLoading={designationsQuery.isPending}
            error={designationsQuery.isError ? designationsQuery.error : null}
            onRetry={designationsQuery.refetch}
            emptyTitle="No designations found"
          />
        </Box>
      )}

      {/* TAB 3: DONOR TYPE */}
      {activeTab === 2 && (
        <Box>
          <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ maxWidth: 380, flex: 1, minWidth: 240 }}>
              <SearchField
                value={donorTypeSearch}
                onChange={setDonorTypeSearch}
                placeholder="Search donor type name or code…"
              />
            </Box>

            <Select
              size="small"
              value={donorTypeStatusFilter}
              onChange={(e) => setDonorTypeStatusFilter(e.target.value)}
              sx={{ minWidth: 140, borderRadius: 2 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </Stack>

          <DataTable
            columns={donorTypeColumns}
            rows={filteredDonorTypes}
            getRowKey={(r) => r.id}
            isLoading={donorTypesQuery.isPending}
            error={donorTypesQuery.isError ? donorTypesQuery.error : null}
            onRetry={donorTypesQuery.refetch}
            emptyTitle="No donor types found"
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
                autoFocus
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
            <Button
              type="submit"
              variant="contained"
              disabled={!newDeptName.trim() || createDepartment.isPending}
            >
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
                label="Designation Name *"
                placeholder="e.g. Senior Financial Analyst"
                value={newDesigName}
                onChange={(e) => setNewDesigName(e.target.value)}
                fullWidth
                size="small"
                autoFocus
              />
              <TextField
                select
                label="Department Name *"
                value={selectedDesigDepartmentId}
                onChange={(e) => setNewDesigDepartmentId(e.target.value)}
                fullWidth
                size="small"
              >
                {(allDepartmentsQuery.data || []).map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Status *"
                value={newDesigStatus}
                onChange={(e) => setNewDesigStatus(e.target.value)}
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
            <Button
              type="submit"
              variant="contained"
              disabled={!newDesigName.trim() || !selectedDesigDepartmentId || createDesignation.isPending}
            >
              Save Designation
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG: ADD DONOR TYPE */}
      <Dialog open={newDonorTypeOpen} onClose={() => setNewDonorTypeOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddDonorType}>
          <DialogTitle sx={{ fontWeight: 700 }}>Add New Donor Type</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Donor Type Name"
                placeholder="e.g. Trust"
                value={newDonorTypeName}
                onChange={(e) => setNewDonorTypeName(e.target.value)}
                required
                fullWidth
                size="small"
                autoFocus
              />
              <FormControl fullWidth size="small">
                <InputLabel id="donor-type-fsd-label">Fund Source Domicile</InputLabel>
                <Select
                  labelId="donor-type-fsd-label"
                  multiple
                  value={newDonorTypeFundSourceDomiciles}
                  onChange={(e) => setNewDonorTypeFundSourceDomiciles(e.target.value)}
                  input={<OutlinedInput label="Fund Source Domicile" />}
                  renderValue={(selected) =>
                    selected.length ? selected.map((v) => (v === 'DOMESTIC' ? 'Domestic' : 'Foreign')).join(', ') : 'Any'
                  }
                >
                  {[
                    { value: 'DOMESTIC', label: 'Domestic' },
                    { value: 'FOREIGN', label: 'Foreign' },
                  ].map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Checkbox checked={newDonorTypeFundSourceDomiciles.includes(opt.value)} />
                      <ListItemText primary={opt.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel id="donor-type-contribution-label">Contribution Type</InputLabel>
                <Select
                  labelId="donor-type-contribution-label"
                  multiple
                  value={newDonorTypeContributionTypes}
                  onChange={(e) => setNewDonorTypeContributionTypes(e.target.value)}
                  input={<OutlinedInput label="Contribution Type" />}
                  renderValue={(selected) => (selected.length ? selected.join(', ') : 'Any')}
                >
                  {[
                    { value: 'LC', label: 'LC — Local contribution' },
                    { value: 'FC', label: 'FC — Foreign contribution' },
                  ].map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Checkbox checked={newDonorTypeContributionTypes.includes(opt.value)} />
                      <ListItemText primary={opt.label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                select
                label="Status"
                value={newDonorTypeStatus}
                onChange={(e) => setNewDonorTypeStatus(e.target.value)}
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
            <Button onClick={() => setNewDonorTypeOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!newDonorTypeName.trim() || createDonorType.isPending}
            >
              Save Donor Type
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
            ? `Are you sure you want to change the status of "${deptToToggle.name}" from ${deptToToggle.statusLabel.toLowerCase()} to ${
                deptToToggle.status === 'ACTIVE' ? 'inactive' : 'active'
              }?`
            : ''
        }
        confirmLabel="Confirm"
        confirmColor={deptToToggle?.status === 'ACTIVE' ? 'warning' : 'primary'}
        busy={departmentLifecycle.isPending}
        onConfirm={handleConfirmDeptStatusChange}
        onClose={() => setDeptToToggle(null)}
      />

      {/* CONFIRM STATUS TOGGLE DIALOG - DESIGNATION */}
      <ConfirmDialog
        open={Boolean(desigToToggle)}
        title="Change Designation Status"
        description={
          desigToToggle
            ? `Are you sure you want to change the status of "${desigToToggle.name}" from ${desigToToggle.statusLabel.toLowerCase()} to ${
                desigToToggle.status === 'ACTIVE' ? 'inactive' : 'active'
              }?`
            : ''
        }
        confirmLabel="Confirm"
        confirmColor={desigToToggle?.status === 'ACTIVE' ? 'warning' : 'primary'}
        busy={designationLifecycle.isPending}
        onConfirm={handleConfirmDesigStatusChange}
        onClose={() => setDesigToToggle(null)}
      />

      {/* CONFIRM STATUS TOGGLE DIALOG - DONOR TYPE */}
      <ConfirmDialog
        open={Boolean(donorTypeToToggle)}
        title="Change Donor Type Status"
        description={
          donorTypeToToggle
            ? `Are you sure you want to change the status of "${donorTypeToToggle.name}" from ${donorTypeToToggle.statusLabel.toLowerCase()} to ${
                donorTypeToToggle.status === 'ACTIVE' ? 'inactive' : 'active'
              }?`
            : ''
        }
        confirmLabel="Confirm"
        confirmColor={donorTypeToToggle?.status === 'ACTIVE' ? 'warning' : 'primary'}
        busy={donorTypeLifecycle.isPending}
        onConfirm={handleConfirmDonorTypeStatusChange}
        onClose={() => setDonorTypeToToggle(null)}
      />
    </Box>
  );
}
