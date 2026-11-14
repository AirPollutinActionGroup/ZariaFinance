import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
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
import { ConfirmDialog, DataTable, StatusChip } from '../../../shared/components/index.js';
import {
  MasterToolbar,
  NameCell,
  actionsColumn,
  applyStatusFilter,
  statusColumn,
  toggleDialogText,
} from './MasterListParts.jsx';
import {
  useCreateDocumentType,
  useDocumentTypeLifecycle,
  useDocumentTypes,
  useUpdateDocumentType,
} from '../hooks/useDocumentTypes.js';

const EMPTY_FORM = { name: '', code: '', status: 'ACTIVE', allowedFundSourceDomiciles: [] };

const DOMICILE_LABEL = { DOMESTIC: 'Domestic', FOREIGN: 'Foreign' };

/** "GST Number" → GST_NUMBER — the code the backend derives when none is typed. */
const toCode = (text) =>
  text
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

/**
 * Master Configuration → Document Type (server-backed, /api/v1/document-types):
 * the identity documents a donor can be identified by (PAN Card, Aadhaar Card, …).
 * Same layout as the Budget Category tab. `createOpen` / `onCreateClose` are
 * driven by the toolbar's "Add Document Type" button.
 */
export function DocumentTypeTab({ createOpen, onCreateClose, onCreate }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toToggle, setToToggle] = useState(null);

  const typesQuery = useDocumentTypes(search);
  const createType = useCreateDocumentType();
  const updateType = useUpdateDocumentType();
  const lifecycle = useDocumentTypeLifecycle();
  const saving = createType.isPending || updateType.isPending;
  const saveError = createType.error || updateType.error;
  const dialogOpen = createOpen || Boolean(editing);

  const rows = useMemo(() => {
    const list = typesQuery.data || [];
    return applyStatusFilter(list, statusFilter);
  }, [typesQuery.data, statusFilter]);

  const openEdit = (type) => {
    createType.reset();
    updateType.reset();
    setForm({
      name: type.name,
      code: type.code,
      status: type.status,
      allowedFundSourceDomiciles: type.allowedFundSourceDomiciles || [],
    });
    setEditing(type);
  };

  const closeDialog = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    createType.reset();
    updateType.reset();
    onCreateClose();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      if (editing) await updateType.mutateAsync({ id: editing.id, values: form });
      else await createType.mutateAsync(form);
      closeDialog();
    } catch {
      // Shown in the dialog via saveError.
    }
  };

  const handleConfirmToggle = async () => {
    if (!toToggle) return;
    await lifecycle.mutateAsync({ id: toToggle.id, action: toToggle.status === 'ACTIVE' ? 'deactivate' : 'activate' });
    setToToggle(null);
  };

  const columns = [
    {
      key: 'name',
      header: 'Document type',
      sortValue: (r) => r.name,
      render: (r) => <NameCell name={r.name} />,
    },
    {
      key: 'code',
      header: 'Code',
      sortValue: (r) => r.code,
      render: (r) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12.5, color: 'text.secondary' }}>
          {r.code}
        </Typography>
      ),
    },
    {
      key: 'domicile',
      header: 'Offered to',
      render: (r) =>
        r.allowedFundSourceDomiciles.length ? (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
            {r.allowedFundSourceDomiciles.map((v) => (
              <StatusChip key={v} label={DOMICILE_LABEL[v] || v} tone={v === 'FOREIGN' ? 'graphite' : 'neutral'} />
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary">
            All donors
          </Typography>
        ),
    },
    statusColumn,
    actionsColumn({ onEdit: openEdit, onToggle: setToToggle }),
  ];

  const toggleText = toggleDialogText(
    toToggle,
    'document type',
    'Donors that already use it keep it, but it will no longer be offered on the donor form.',
  );

  const codePreview = toCode(form.code || form.name);

  return (
    <Box>
      <MasterToolbar
        search={search}
        onSearch={setSearch}
        placeholder="Search name or code…"
        status={statusFilter}
        onStatus={setStatusFilter}
        rows={typesQuery.data || []}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate}>New document type</Button>}
      />

      <DataTable
        dense
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        defaultSort={{ key: 'name', direction: 'asc' }}
        isLoading={typesQuery.isPending}
        error={typesQuery.isError ? typesQuery.error : null}
        onRetry={typesQuery.refetch}
        emptyTitle="No document types found"
        emptyDescription="Document types are the ID documents a donor can be identified by — PAN Card, Aadhaar Card, Passport ID, …"
      />

      <Dialog open={dialogOpen} onClose={saving ? undefined : closeDialog} maxWidth="xs" fullWidth>
        <form onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit document type' : 'New document type'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Document Type Name"
                placeholder="e.g. GST Number"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                fullWidth
                size="small"
                autoFocus
              />
              <TextField
                select
                label="Fund Source Domicile"
                value={form.allowedFundSourceDomiciles}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, allowedFundSourceDomiciles: typeof v === 'string' ? v.split(',') : v }));
                }}
                fullWidth
                size="small"
                helperText="Which donors this ID type is offered to. Leave empty for both."
                slotProps={{
                  select: {
                    multiple: true,
                    displayEmpty: true,
                    renderValue: (selected) =>
                      selected.length ? selected.map((v) => DOMICILE_LABEL[v] || v).join(', ') : 'Both (domestic and foreign)',
                  },
                  inputLabel: { shrink: true },
                }}
              >
                {Object.entries(DOMICILE_LABEL).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    <Checkbox size="small" checked={form.allowedFundSourceDomiciles.includes(value)} sx={{ py: 0, pl: 0 }} />
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              {editing ? (
                <Typography variant="caption" color="text.secondary">
                  Code <Box component="span" sx={{ fontFamily: 'monospace' }}>{editing.code}</Box> stays the same —
                  donors already using this type keep it when it is renamed.
                </Typography>
              ) : (
                <>
                  <TextField
                    label="Code (optional)"
                    placeholder="Made from the name if left blank"
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    fullWidth
                    size="small"
                    helperText={codePreview ? `Will be saved as ${codePreview} — it can't be changed later` : ' '}
                  />
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
                </>
              )}
              {saveError ? <Alert severity="error">{saveError.message || 'Could not save the document type.'}</Alert> : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={closeDialog} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!form.name.trim() || saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Document Type'}
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
