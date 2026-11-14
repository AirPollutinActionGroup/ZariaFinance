import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { SearchField, StatusChip } from '../../../shared/components/index.js';

/** Status filter values match the backend status strings ('ACTIVE' / 'INACTIVE'). */
const STATUS_FILTERS = [
  { value: 'All', label: 'All', match: () => true },
  { value: 'ACTIVE', label: 'Active', match: (r) => r.status === 'ACTIVE' },
  { value: 'INACTIVE', label: 'Inactive', match: (r) => r.status !== 'ACTIVE' },
];

export function applyStatusFilter(rows, filter) {
  const f = STATUS_FILTERS.find((s) => s.value === filter) || STATUS_FILTERS[0];
  return rows.filter(f.match);
}

/** Search box plus All / Active / Inactive chips with counts; `action` (e.g. an Add button) sits on the right. */
export function MasterToolbar({ search, onSearch, placeholder, status, onStatus, rows = [], action = null }) {
  return (
    <Stack direction="row" sx={{ mb: 1.5, gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      <Box sx={{ width: { xs: '100%', sm: 280 }, mr: { sm: 1 } }}>
        <SearchField value={search} onChange={onSearch} placeholder={placeholder} />
      </Box>
      {STATUS_FILTERS.map((f) => {
        const selected = status === f.value;
        const count = rows.filter(f.match).length;
        if (f.value === 'INACTIVE' && count === 0 && !selected) return null;
        return (
          <Chip
            key={f.value}
            size="small"
            label={`${f.label} · ${count}`}
            onClick={() => onStatus(f.value)}
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            aria-pressed={selected}
          />
        );
      })}
      {action ? <Box sx={{ ml: 'auto' }}>{action}</Box> : null}
    </Stack>
  );
}

export const statusColumn = {
  key: 'status',
  header: 'Status',
  width: 110,
  sortValue: (r) => (r.status === 'ACTIVE' ? 0 : 1),
  render: (r) => (
    <StatusChip
      label={r.statusLabel || (r.status === 'ACTIVE' ? 'Active' : 'Inactive')}
      tone={r.status === 'ACTIVE' ? 'success' : 'neutral'}
    />
  ),
};

/**
 * Right-aligned row actions: optional Edit, and Deactivate / Activate named
 * for what it will do (rather than a generic "Change status").
 */
export function actionsColumn({ onEdit, onToggle }) {
  return {
    key: 'actions',
    header: '',
    align: 'right',
    width: onEdit ? 180 : 120,
    render: (r) => {
      const active = r.status === 'ACTIVE';
      return (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          {onEdit ? (
            <Button size="small" color="inherit" onClick={() => onEdit(r)} sx={{ minWidth: 0, px: 1.25 }}>
              Edit
            </Button>
          ) : null}
          <Button
            size="small"
            color={active ? 'warning' : 'success'}
            onClick={() => onToggle(r)}
            sx={{ minWidth: 0, px: 1.25 }}
          >
            {active ? 'Deactivate' : 'Activate'}
          </Button>
        </Stack>
      );
    },
  };
}

/** Bold name cell, optionally with a muted second line. */
export function NameCell({ name, sub, mono = false }) {
  return (
    <Box sx={{ minWidth: 160 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35, fontFamily: mono ? 'monospace' : undefined }}>
        {name}
      </Typography>
      {sub ? (
        <Typography variant="caption" color="text.secondary">
          {sub}
        </Typography>
      ) : null}
    </Box>
  );
}

/** Confirm-dialog wording shared by every master: "Deactivate “X”?" etc. */
export function toggleDialogText(row, noun, extra = '') {
  if (!row) return { title: '', description: '', confirmLabel: 'Confirm' };
  const active = row.status === 'ACTIVE';
  return {
    title: `${active ? 'Deactivate' : 'Activate'} ${noun}?`,
    description: active
      ? `“${row.name}” will be marked inactive.${extra ? ` ${extra}` : ''}`
      : `“${row.name}” will be marked active again.`,
    confirmLabel: active ? 'Deactivate' : 'Activate',
  };
}
