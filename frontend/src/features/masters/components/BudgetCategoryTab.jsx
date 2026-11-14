import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ConfirmDialog, DataTable } from '../../../shared/components/index.js';
import {
  MasterToolbar,
  NameCell,
  actionsColumn,
  applyStatusFilter,
  statusColumn,
  toggleDialogText,
} from './MasterListParts.jsx';
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
 * `createOpen` / `onCreateClose` are driven by the toolbar's
 * "Add Budget Category" button.
 */
export function BudgetCategoryTab({ createOpen, onCreateClose, onCreate }) {
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
    return applyStatusFilter(list, statusFilter);
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
      key: 'name',
      header: 'Category',
      sortValue: (r) => r.name,
      render: (r) => <NameCell name={r.name} sub={r.description} />,
    },
    {
      key: 'usage',
      header: 'Used in',
      sortValue: (r) => usage[r.id] || 0,
      render: (r) => (
        <Typography variant="body2" color={usage[r.id] ? 'text.primary' : 'text.secondary'} sx={{ whiteSpace: 'nowrap' }}>
          {usage[r.id] ? `${usage[r.id]} budget ${usage[r.id] === 1 ? 'line' : 'lines'}` : 'Not used yet'}
        </Typography>
      ),
    },
    statusColumn,
    actionsColumn({ onEdit: openEdit, onToggle: setToToggle }),
  ];

  const toggleText = toggleDialogText(
    toToggle,
    'budget category',
    toToggle && usage[toToggle.id]
      ? `It is used on ${usage[toToggle.id]} budget ${usage[toToggle.id] === 1 ? 'line' : 'lines'}; those keep it, but new lines can't pick it.`
      : '',
  );

  return (
    <Box>
      <MasterToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search categories…"
        status={statusFilter}
        onStatus={setStatusFilter}
        rows={categoriesQuery.data || []}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>New budget category</Button>}
      />

      <DataTable
        dense
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        defaultSort={{ key: 'name', direction: 'asc' }}
        isLoading={categoriesQuery.isPending}
        error={categoriesQuery.isError ? categoriesQuery.error : null}
        onRetry={categoriesQuery.refetch}
        emptyTitle="No budget categories found"
        emptyDescription="Budget categories are the heads each budget line is booked against."
      />

      <Dialog open={dialogOpen} onClose={saving ? undefined : closeDialog} maxWidth="xs" fullWidth>
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit budget category' : 'New budget category'}</DialogTitle>
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
        title={toggleText.title}
        description={toggleText.description}
        confirmLabel={toggleText.confirmLabel}
        confirmColor={toToggle?.status === 'ACTIVE' ? 'warning' : 'primary'}
        busy={lifecycle.isPending}
        onConfirm={handleConfirmToggle}
        onClose={() => setToToggle(null)}
      />
    </Box>
  );
}
