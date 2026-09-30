import { useMemo, useState } from 'react';
import {
  Alert,
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
  TextField,
  Typography,
} from '@mui/material';
import { ConfirmDialog, DataTable, SearchField } from '../../../shared/components/index.js';
import {
  useBudgetCategories,
  useBudgetCategoryLifecycle,
  useCreateBudgetCategory,
  useUpdateBudgetCategory,
} from '../hooks/useBudgetCategories.js';
import { useBudgetCategoryUsage } from '../../budget/hooks/useBudgets.js';

const EMPTY_FORM = { name: '', description: '', status: 'ACTIVE' };

/**
 * Master Configuration → Budget Category (server-backed, /api/v1/budget-categories).
 * Same layout as the Department / Designation / Donor Type tabs.
 * `createOpen` / `onCreateClose` are driven by the page header's
 * "Add Budget Category" button.
 */
export function BudgetCategoryTab({ createOpen, onCreateClose }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editing, setEditing] = useState(null); // category being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [toToggle, setToToggle] = useState(null);

  const categoriesQuery = useBudgetCategories(search);
  const createCategory = useCreateBudgetCategory();
  const updateCategory = useUpdateBudgetCategory();
  const lifecycle = useBudgetCategoryLifecycle();
  const saving = createCategory.isPending || updateCategory.isPending;
  const saveError = createCategory.error || updateCategory.error;

  const dialogOpen = createOpen || Boolean(editing);

  // How many budget lines use each category (server: { [categoryId]: count }) — helps decide before deactivating.
  const usageQuery = useBudgetCategoryUsage();
  const usage = usageQuery.data || {};

  const rows = useMemo(() => {
    const list = categoriesQuery.data || [];
    const filtered = statusFilter === 'All' ? list : list.filter((c) => c.status === statusFilter);
    return filtered.map((c, index) => ({ ...c, srNo: index + 1 }));
  }, [categoriesQuery.data, statusFilter]);

  const openEdit = (category) => {
    createCategory.reset();
    updateCategory.reset();
    setForm({ name: category.name, description: category.description || '', status: category.status });
    setEditing(category);
  };

  const closeDialog = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    createCategory.reset();
    updateCategory.reset();
    onCreateClose();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      if (editing) await updateCategory.mutateAsync({ id: editing.id, values: form });
      else await createCategory.mutateAsync(form);
      closeDialog();
    } catch {
      // Shown in the dialog via saveError.
    }
  };

  const handleConfirmToggle = async () => {
    if (!toToggle) return;
    const action = toToggle.status === 'ACTIVE' ? 'deactivate' : 'activate';
    await lifecycle.mutateAsync({ id: toToggle.id, action });
    setToToggle(null);
  };

  const columns = [
    {
      key: 'srNo',
      header: 'S.NO',
      width: '8%',
      align: 'center',
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.srNo}</Typography>,
    },
    {
      key: 'name',
      header: 'CATEGORY NAME',
      width: '22%',
      align: 'center',
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.name}</Typography>
      ),
    },
    {
      key: 'description',
      header: 'DESCRIPTION',
      width: '30%',
      align: 'center',
      render: (r) => <Typography variant="body2" color="text.secondary">{r.description || '—'}</Typography>,
    },
    {
      key: 'usage',
      header: 'USED IN',
      width: '12%',
      align: 'center',
      render: (r) => (
        <Typography variant="body2">
          {usage[r.id] ? `${usage[r.id]} budget ${usage[r.id] === 1 ? 'line' : 'lines'}` : '—'}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '12%',
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
      width: '16%',
      align: 'center',
      render: (r) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button size="small" variant="outlined" onClick={() => openEdit(r)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color={r.status === 'ACTIVE' ? 'warning' : 'success'}
            onClick={() => setToToggle(r)}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Change Status
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 380, flex: 1, minWidth: 240 }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search category name…" />
        </Box>
        <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 140, borderRadius: 2 }}>
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="INACTIVE">Inactive</MenuItem>
        </Select>
      </Stack>

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        isLoading={categoriesQuery.isPending}
        error={categoriesQuery.isError ? categoriesQuery.error : null}
        onRetry={categoriesQuery.refetch}
        emptyTitle="No budget categories found"
        emptyDescription="Budget categories are the heads each budget line is booked against."
      />

      <Dialog open={dialogOpen} onClose={saving ? undefined : closeDialog} maxWidth="xs" fullWidth>
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Budget Category' : 'Add New Budget Category'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Category Name"
                placeholder="e.g. Training & capacity building"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                fullWidth
                size="small"
                autoFocus
              />
              <TextField
                label="Description"
                placeholder="What kind of spend goes under this head"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                fullWidth
                size="small"
                multiline
                minRows={2}
              />
              {editing ? (
                <Typography variant="caption" color="text.secondary">
                  Existing budget lines keep this category when it is renamed.
                </Typography>
              ) : (
                <TextField
                  select
                  label="Status"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  required
                  fullWidth
                  size="small"
                >
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </TextField>
              )}
              {saveError ? <Alert severity="error">{saveError.message || 'Could not save the category.'}</Alert> : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!form.name.trim() || saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Category'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toToggle)}
        title="Change Budget Category Status"
        description={
          toToggle
            ? `Are you sure you want to change the status of "${toToggle.name}" from ${toToggle.statusLabel.toLowerCase()} to ${
                toToggle.status === 'ACTIVE' ? 'inactive' : 'active'
              }?${
                toToggle.status === 'ACTIVE' && usage[toToggle.id]
                  ? ` It is used on ${usage[toToggle.id]} budget ${usage[toToggle.id] === 1 ? 'line' : 'lines'}; those keep it, but new lines can't pick it.`
                  : ''
              }`
            : ''
        }
        confirmLabel="Confirm"
        confirmColor={toToggle?.status === 'ACTIVE' ? 'warning' : 'primary'}
        busy={lifecycle.isPending}
        onConfirm={handleConfirmToggle}
        onClose={() => setToToggle(null)}
      />
    </Box>
  );
}
