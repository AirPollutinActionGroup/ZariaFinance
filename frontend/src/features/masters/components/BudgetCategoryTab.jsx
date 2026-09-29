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
import { MASTER_STATUS_LABEL } from '../constants.js';
import { useBudgetCategories } from '../../budget/hooks/useBudgetCategories.js';
import {
  createBudgetCategory,
  setBudgetCategoryStatus,
  updateBudgetCategory,
} from '../../budget/data/budgetCategoryRepository.js';
import { getBudgets } from '../../budget/data/budgetRepository.js';

const EMPTY_FORM = { name: '', description: '', status: 'ACTIVE' };

/**
 * Master Configuration → Budget Category. Same layout as the Department /
 * Designation / Donor Type tabs. `createOpen` / `onCreateClose` are driven by
 * the page header's "Add Budget Category" button.
 */
export function BudgetCategoryTab({ createOpen, onCreateClose }) {
  const categories = useBudgetCategories();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editing, setEditing] = useState(null); // category being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [toToggle, setToToggle] = useState(null);

  const dialogOpen = createOpen || Boolean(editing);

  // How many budget lines use each category — helps decide before deactivating.
  const usage = useMemo(() => {
    const counts = {};
    for (const budget of getBudgets()) {
      for (const line of budget.lines) counts[line.category] = (counts[line.category] || 0) + 1;
    }
    return counts;
  }, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return categories
      .filter((c) => statusFilter === 'All' || c.status === statusFilter)
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q))
      .map((c, index) => ({ ...c, srNo: index + 1, statusLabel: MASTER_STATUS_LABEL[c.status] }));
  }, [categories, search, statusFilter]);

  const openEdit = (category) => {
    setForm({ name: category.name, description: category.description || '', status: category.status });
    setFormError(null);
    setEditing(category);
  };

  const closeDialog = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    onCreateClose();
  };

  const handleSave = (e) => {
    e.preventDefault();
    try {
      if (editing) updateBudgetCategory(editing.id, form);
      else createBudgetCategory(form);
      closeDialog();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleConfirmToggle = () => {
    setBudgetCategoryStatus(toToggle.id, toToggle.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
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
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.name}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>{r.id}</Typography>
        </Box>
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
          <SearchField value={search} onChange={setSearch} placeholder="Search category name or code…" />
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
        emptyTitle="No budget categories found"
        emptyDescription="Budget categories are the heads each budget line is booked against."
      />

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth>
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
                  Code <Box component="span" sx={{ fontFamily: 'monospace' }}>{editing.id}</Box> stays the same, so existing budget lines keep this category.
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
              {formError ? <Alert severity="error">{formError}</Alert> : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!form.name.trim()}>
              {editing ? 'Save Changes' : 'Save Category'}
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
        onConfirm={handleConfirmToggle}
        onClose={() => setToToggle(null)}
      />
    </Box>
  );
}
