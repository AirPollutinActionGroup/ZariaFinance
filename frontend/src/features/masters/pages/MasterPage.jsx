import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
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
import CategoryIcon from '@mui/icons-material/Category';
import TuneIcon from '@mui/icons-material/Tune';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import { useSearchParams } from 'react-router-dom';
import { BudgetCategoryTab } from '../components/BudgetCategoryTab.jsx';
import { DocumentTypeTab } from '../components/DocumentTypeTab.jsx';
import { FundSuggestionWeightsTab } from '../components/FundSuggestionWeightsTab.jsx';
import {
  MasterToolbar,
  NameCell,
  actionsColumn,
  applyStatusFilter,
  statusColumn,
  toggleDialogText,
} from '../components/MasterListParts.jsx';
import { ConfirmDialog, DataTable, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { useCreateDepartment, useDepartmentLifecycle, useDepartments } from '../hooks/useDepartments.js';
import { useCreateDesignation, useDesignationLifecycle, useDesignations } from '../hooks/useDesignations.js';
import { useCreateDonorType, useDonorTypeLifecycle, useDonorTypes } from '../hooks/useDonorTypes.js';

/**
 * The masters, in tab order. `id` is also the ?tab= value, so links such as
 * /masters?tab=fund-suggestion (from the debit note's fund suggestions) open
 * that master directly.
 */
const MASTERS = [
  {
    id: 'department',
    label: 'Departments',
    icon: ApartmentIcon,
    addLabel: 'New department',
  },
  {
    id: 'designation',
    label: 'Designations',
    icon: BadgeIcon,
    addLabel: 'New designation',
  },
  {
    id: 'donor-type',
    label: 'Donor types',
    icon: VolunteerActivismIcon,
    addLabel: 'New donor type',
  },
  {
    id: 'document-type',
    label: 'Document types',
    icon: ContactPageIcon,
    addLabel: 'New document type',
  },
  {
    id: 'budget-category',
    label: 'Budget categories',
    icon: CategoryIcon,
    addLabel: 'New budget category',
  },
  {
    id: 'fund-suggestion',
    label: 'Fund suggestion',
    icon: TuneIcon,
  },
];

const DOMICILE_LABEL = { DOMESTIC: 'Domestic', FOREIGN: 'Foreign' };

export function MasterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = MASTERS.some((m) => m.id === tabParam) ? tabParam : 'department';
  const active = MASTERS.find((m) => m.id === activeTab);
  const selectTab = (id) => setSearchParams(id === 'department' ? {} : { tab: id }, { replace: true });

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

  // Donor Types State
  const [donorTypeSearch, setDonorTypeSearch] = useState('');
  const [donorTypeStatusFilter, setDonorTypeStatusFilter] = useState('All');
  const [donorTypeToToggle, setDonorTypeToToggle] = useState(null);
  const [newDonorTypeOpen, setNewDonorTypeOpen] = useState(false);
  const [newDonorTypeName, setNewDonorTypeName] = useState('');
  const [newDonorTypeStatus, setNewDonorTypeStatus] = useState('Active');
  const [newDonorTypeFundSourceDomiciles, setNewDonorTypeFundSourceDomiciles] = useState([]);
  const [newDonorTypeContributionTypes, setNewDonorTypeContributionTypes] = useState([]);

  // Budget Category / Document Type — the tab components own their lists; this page only opens their Add dialogs.
  const [newBudgetCategoryOpen, setNewBudgetCategoryOpen] = useState(false);
  const [newDocumentTypeOpen, setNewDocumentTypeOpen] = useState(false);

  const departmentsQuery = useDepartments(deptSearch);
  const createDepartment = useCreateDepartment();
  const departmentLifecycle = useDepartmentLifecycle();

  const designationsQuery = useDesignations(desigSearch);
  const createDesignation = useCreateDesignation();
  const designationLifecycle = useDesignationLifecycle();

  const donorTypesQuery = useDonorTypes(donorTypeSearch);
  const createDonorType = useCreateDonorType();
  const donorTypeLifecycle = useDonorTypeLifecycle();

  // Full, unsearched lists: the department dropdown on the Add Designation
  // dialog and the designation count per department. An empty search shares
  // the tabs' cache entries.
  const allDepartmentsQuery = useDepartments('');
  const allDesignationsQuery = useDesignations('');

  // Defaults the Add Designation dialog's department to the first one loaded,
  // until the user picks a different one — computed, not stored, to avoid a
  // setState-in-effect render cascade.
  const selectedDesigDepartmentId = newDesigDepartmentId || allDepartmentsQuery.data?.[0]?.id || '';

  const departments = departmentsQuery.data || [];
  const designations = designationsQuery.data || [];
  const donorTypes = donorTypesQuery.data || [];
  const filteredDepartments = useMemo(
    () => applyStatusFilter(departmentsQuery.data || [], deptStatusFilter),
    [departmentsQuery.data, deptStatusFilter],
  );
  const filteredDesignations = useMemo(
    () => applyStatusFilter(designationsQuery.data || [], desigStatusFilter),
    [designationsQuery.data, desigStatusFilter],
  );
  const filteredDonorTypes = useMemo(
    () => applyStatusFilter(donorTypesQuery.data || [], donorTypeStatusFilter),
    [donorTypesQuery.data, donorTypeStatusFilter],
  );

  // How many designations each department has — shown on the department rows.
  const designationCountByDept = useMemo(() => {
    const counts = {};
    (allDesignationsQuery.data || []).forEach((d) => {
      counts[d.departmentName] = (counts[d.departmentName] || 0) + 1;
    });
    return counts;
  }, [allDesignationsQuery.data]);

  const toggle = (lifecycle, row, clear) => async () => {
    if (!row) return;
    await lifecycle.mutateAsync({ id: row.id, action: row.status === 'ACTIVE' ? 'deactivate' : 'activate' });
    clear(null);
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    await createDepartment.mutateAsync({ name: newDeptName, status: newDeptStatus });
    setNewDeptName('');
    setNewDeptStatus('Active');
    setNewDeptOpen(false);
  };

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

  const departmentColumns = [
    {
      key: 'name',
      header: 'Department',
      sortValue: (r) => r.name,
      render: (r) => <NameCell name={r.name} mono />,
    },
    {
      key: 'designations',
      header: 'Designations',
      sortValue: (r) => designationCountByDept[r.name] || 0,
      render: (r) => {
        const n = designationCountByDept[r.name] || 0;
        return (
          <Typography variant="body2" color={n ? 'text.primary' : 'text.secondary'}>
            {n || '—'}
          </Typography>
        );
      },
    },
    statusColumn,
    actionsColumn({ onToggle: setDeptToToggle }),
  ];

  const designationColumns = [
    {
      key: 'name',
      header: 'Designation',
      sortValue: (r) => r.name,
      render: (r) => <NameCell name={r.name} />,
    },
    {
      key: 'departmentName',
      header: 'Department',
      sortValue: (r) => r.departmentName,
      render: (r) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12.5, color: 'text.secondary' }}>
          {r.departmentName || '—'}
        </Typography>
      ),
    },
    statusColumn,
    actionsColumn({ onToggle: setDesigToToggle }),
  ];

  const anyChip = (
    <Typography variant="caption" color="text.secondary">
      Any
    </Typography>
  );
  const donorTypeColumns = [
    {
      key: 'name',
      header: 'Donor type',
      sortValue: (r) => r.name,
      render: (r) => <NameCell name={r.name} />,
    },
    {
      key: 'allowedFundSourceDomiciles',
      header: 'Fund source',
      render: (r) =>
        r.allowedFundSourceDomiciles.length ? (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
            {r.allowedFundSourceDomiciles.map((v) => (
              <StatusChip key={v} label={DOMICILE_LABEL[v] || v} tone={v === 'FOREIGN' ? 'graphite' : 'neutral'} />
            ))}
          </Stack>
        ) : (
          anyChip
        ),
    },
    {
      key: 'allowedContributionTypes',
      header: 'Contribution',
      render: (r) =>
        r.allowedContributionTypes.length ? (
          <Stack direction="row" spacing={0.5}>
            {r.allowedContributionTypes.map((v) => (
              <StatusChip key={v} label={v} tone="outlined" />
            ))}
          </Stack>
        ) : (
          anyChip
        ),
    },
    statusColumn,
    actionsColumn({ onToggle: setDonorTypeToToggle }),
  ];

  const addAction = {
    department: () => setNewDeptOpen(true),
    designation: () => setNewDesigOpen(true),
    'donor-type': () => setNewDonorTypeOpen(true),
  }[activeTab];
  const addButton = addAction ? (
    <Button variant="contained" startIcon={<AddIcon />} onClick={addAction}>
      {active.addLabel}
    </Button>
  ) : null;

  const deptDialog = toggleDialogText(deptToToggle, 'department');
  const desigDialog = toggleDialogText(desigToToggle, 'designation');
  const donorTypeDialog = toggleDialogText(donorTypeToToggle, 'donor type');

  return (
    <Box>
      <PageHeader
        title="Master Configuration"
        subtitle="Lists and settings used across the finance, donor and HR modules"
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
        <Tabs
          value={activeTab}
          onChange={(_, id) => selectTab(id)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13.5, minHeight: 44 } }}
        >
          {MASTERS.map((m) => {
            const Icon = m.icon;
            return <Tab key={m.id} value={m.id} icon={<Icon sx={{ fontSize: 18 }} />} iconPosition="start" label={m.label} />;
          })}
        </Tabs>
      </Box>

      {activeTab === 'department' && (
        <>
          <MasterToolbar
            search={deptSearch}
            onSearch={setDeptSearch}
            placeholder="Search departments…"
            status={deptStatusFilter}
            onStatus={setDeptStatusFilter}
            rows={departments}
            action={addButton}
          />
          <DataTable
            dense
            columns={departmentColumns}
            rows={filteredDepartments}
            getRowKey={(r) => r.id}
            defaultSort={{ key: 'name', direction: 'asc' }}
            isLoading={departmentsQuery.isPending}
            error={departmentsQuery.isError ? departmentsQuery.error : null}
            onRetry={departmentsQuery.refetch}
            emptyTitle="No departments found"
          />
        </>
      )}

      {activeTab === 'designation' && (
        <>
          <MasterToolbar
            search={desigSearch}
            onSearch={setDesigSearch}
            placeholder="Search designations…"
            status={desigStatusFilter}
            onStatus={setDesigStatusFilter}
            rows={designations}
            action={addButton}
          />
          <DataTable
            dense
            columns={designationColumns}
            rows={filteredDesignations}
            getRowKey={(r) => r.id}
            defaultSort={{ key: 'departmentName', direction: 'asc' }}
            isLoading={designationsQuery.isPending}
            error={designationsQuery.isError ? designationsQuery.error : null}
            onRetry={designationsQuery.refetch}
            emptyTitle="No designations found"
          />
        </>
      )}

      {activeTab === 'donor-type' && (
        <>
          <MasterToolbar
            search={donorTypeSearch}
            onSearch={setDonorTypeSearch}
            placeholder="Search donor types…"
            status={donorTypeStatusFilter}
            onStatus={setDonorTypeStatusFilter}
            rows={donorTypes}
            action={addButton}
          />
          <DataTable
            dense
            columns={donorTypeColumns}
            rows={filteredDonorTypes}
            getRowKey={(r) => r.id}
            defaultSort={{ key: 'name', direction: 'asc' }}
            isLoading={donorTypesQuery.isPending}
            error={donorTypesQuery.isError ? donorTypesQuery.error : null}
            onRetry={donorTypesQuery.refetch}
            emptyTitle="No donor types found"
          />
        </>
      )}

      {activeTab === 'document-type' && (
        <DocumentTypeTab
          createOpen={newDocumentTypeOpen}
          onCreate={() => setNewDocumentTypeOpen(true)}
          onCreateClose={() => setNewDocumentTypeOpen(false)}
        />
      )}

      {activeTab === 'budget-category' && (
        <BudgetCategoryTab
          createOpen={newBudgetCategoryOpen}
          onCreate={() => setNewBudgetCategoryOpen(true)}
          onCreateClose={() => setNewBudgetCategoryOpen(false)}
        />
      )}

      {activeTab === 'fund-suggestion' && <FundSuggestionWeightsTab />}

      {/* DIALOG: ADD DEPARTMENT */}
      <Dialog open={newDeptOpen} onClose={() => setNewDeptOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddDepartment}>
          <DialogTitle sx={{ fontWeight: 700 }}>New department</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Department name"
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
            <Button type="submit" variant="contained" disabled={!newDeptName.trim() || createDepartment.isPending}>
              Save department
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG: ADD DESIGNATION */}
      <Dialog open={newDesigOpen} onClose={() => setNewDesigOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddDesignation}>
          <DialogTitle sx={{ fontWeight: 700 }}>New designation</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Designation name"
                placeholder="e.g. Senior Financial Analyst"
                value={newDesigName}
                onChange={(e) => setNewDesigName(e.target.value)}
                required
                fullWidth
                size="small"
                autoFocus
              />
              <TextField
                select
                label="Department"
                value={selectedDesigDepartmentId}
                onChange={(e) => setNewDesigDepartmentId(e.target.value)}
                required
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
            <Button
              type="submit"
              variant="contained"
              disabled={!newDesigName.trim() || !selectedDesigDepartmentId || createDesignation.isPending}
            >
              Save designation
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DIALOG: ADD DONOR TYPE */}
      <Dialog open={newDonorTypeOpen} onClose={() => setNewDonorTypeOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={handleAddDonorType}>
          <DialogTitle sx={{ fontWeight: 700 }}>New donor type</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Donor type name"
                placeholder="e.g. Trust"
                value={newDonorTypeName}
                onChange={(e) => setNewDonorTypeName(e.target.value)}
                required
                fullWidth
                size="small"
                autoFocus
              />
              <FormControl fullWidth size="small">
                <InputLabel id="donor-type-fsd-label">Fund source domicile</InputLabel>
                <Select
                  labelId="donor-type-fsd-label"
                  multiple
                  value={newDonorTypeFundSourceDomiciles}
                  onChange={(e) => setNewDonorTypeFundSourceDomiciles(e.target.value)}
                  input={<OutlinedInput label="Fund source domicile" />}
                  renderValue={(selected) =>
                    selected.length ? selected.map((v) => DOMICILE_LABEL[v] || v).join(', ') : 'Any'
                  }
                >
                  {Object.entries(DOMICILE_LABEL).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      <Checkbox checked={newDonorTypeFundSourceDomiciles.includes(value)} />
                      <ListItemText primary={label} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel id="donor-type-contribution-label">Contribution type</InputLabel>
                <Select
                  labelId="donor-type-contribution-label"
                  multiple
                  value={newDonorTypeContributionTypes}
                  onChange={(e) => setNewDonorTypeContributionTypes(e.target.value)}
                  input={<OutlinedInput label="Contribution type" />}
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
            <Button type="submit" variant="contained" disabled={!newDonorTypeName.trim() || createDonorType.isPending}>
              Save donor type
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deptToToggle)}
        title={deptDialog.title}
        description={deptDialog.description}
        confirmLabel={deptDialog.confirmLabel}
        confirmColor={deptToToggle?.status === 'ACTIVE' ? 'warning' : 'primary'}
        busy={departmentLifecycle.isPending}
        onConfirm={toggle(departmentLifecycle, deptToToggle, setDeptToToggle)}
        onClose={() => setDeptToToggle(null)}
      />
      <ConfirmDialog
        open={Boolean(desigToToggle)}
        title={desigDialog.title}
        description={desigDialog.description}
        confirmLabel={desigDialog.confirmLabel}
        confirmColor={desigToToggle?.status === 'ACTIVE' ? 'warning' : 'primary'}
        busy={designationLifecycle.isPending}
        onConfirm={toggle(designationLifecycle, desigToToggle, setDesigToToggle)}
        onClose={() => setDesigToToggle(null)}
      />
      <ConfirmDialog
        open={Boolean(donorTypeToToggle)}
        title={donorTypeDialog.title}
        description={donorTypeDialog.description}
        confirmLabel={donorTypeDialog.confirmLabel}
        confirmColor={donorTypeToToggle?.status === 'ACTIVE' ? 'warning' : 'primary'}
        busy={donorTypeLifecycle.isPending}
        onConfirm={toggle(donorTypeLifecycle, donorTypeToToggle, setDonorTypeToToggle)}
        onClose={() => setDonorTypeToToggle(null)}
      />
    </Box>
  );
}
