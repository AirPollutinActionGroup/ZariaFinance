import { useMemo, useState } from 'react';
import { Box, Button, Chip, Link, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatStrip, StatusChip } from '../../../shared/components/index.js';
import { useVendors } from '../hooks/useVendors.js';
import { ENTITY_TYPE_OPTIONS, MODULE_ID, VENDOR_CATEGORY_OPTIONS } from '../constants.js';

const isActive = (v) => (v.status || 'Active') === 'Active';
const isMsme = (v) => v.hasMsmeRegistration === 'Yes';
const isGst = (v) => v.hasGstRegistration === 'Yes';
const isRelated = (v) => v.relatedParty === 'Yes';

const mono = { fontFamily: 'monospace', fontSize: 12.5 };

const columns = [
  {
    key: 'vendorCode',
    header: 'Code',
    sx: { whiteSpace: 'nowrap' },
    sortValue: (r) => r.vendorCode,
    render: (r) => (
      <Typography variant="body2" sx={{ ...mono, fontWeight: 700 }}>
        {r.vendorCode}
      </Typography>
    ),
  },
  {
    key: 'legalName',
    header: 'Vendor',
    sortValue: (r) => r.legalName,
    render: (r) => (
      <Box sx={{ minWidth: 200 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
          {r.legalName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {[r.entityType, r.vendorCategory].filter(Boolean).join(' · ')}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'panNumber',
    header: 'PAN / GSTIN',
    sortValue: (r) => r.panNumber,
    render: (r) => (
      <Box>
        <Typography variant="body2" sx={mono}>
          {r.panNumber || '—'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={r.gstNumber ? mono : undefined}>
          {r.gstNumber || (r.entityType === 'Individual' ? 'GST n/a' : 'Not GST registered')}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'tdsSection',
    header: 'TDS',
    sortValue: (r) => r.tdsSection,
    render: (r) => r.tdsSection || '—',
  },
  {
    key: 'flags',
    header: 'Flags',
    render: (r) =>
      isMsme(r) || isRelated(r) ? (
        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
          {isMsme(r) ? <StatusChip label="MSME · 45 days" tone="info" /> : null}
          {isRelated(r) ? <StatusChip label="Related party" tone="warning" /> : null}
        </Stack>
      ) : (
        <Typography variant="caption" color="text.disabled">
          —
        </Typography>
      ),
  },
  {
    key: 'contactName',
    header: 'Contact',
    sortValue: (r) => r.contactName,
    render: (r) => (
      <Box sx={{ minWidth: 140 }}>
        <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
          {r.contactName || '—'}
        </Typography>
        {r.phoneNumber ? (
          <Typography variant="caption" color="text.secondary">
            {r.phoneNumber}
          </Typography>
        ) : null}
      </Box>
    ),
  },
  {
    key: 'state',
    header: 'State',
    sx: { whiteSpace: 'nowrap' },
    sortValue: (r) => r.state,
    render: (r) => r.state || '—',
  },
  {
    key: 'status',
    header: 'Status',
    sortValue: (r) => (isActive(r) ? 0 : 1),
    render: (r) => (
      <StatusChip label={isActive(r) ? 'Active' : 'Inactive'} tone={isActive(r) ? 'success' : 'neutral'} />
    ),
  },
];

/** Quick-filter chips; `match` picks the vendors each one shows. */
const QUICK_FILTERS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'active', label: 'Active', match: isActive },
  { value: 'inactive', label: 'Inactive', match: (v) => !isActive(v) },
  { value: 'msme', label: 'MSME', match: isMsme },
  { value: 'related', label: 'Related party', match: isRelated },
];

/** Vendor register — /vendor-registration. */
export function VendorListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const vendorsQuery = useVendors(search);

  // While a new search loads, keep showing the last result so the page doesn't jump.
  const [lastVendors, setLastVendors] = useState(null);
  if (vendorsQuery.data && vendorsQuery.data !== lastVendors) setLastVendors(vendorsQuery.data);
  const shown = vendorsQuery.data || lastVendors;
  const vendors = useMemo(() => shown || [], [shown]);

  // Entity type and category narrow the list first; chip counts reflect that.
  const narrowed = useMemo(
    () =>
      vendors.filter(
        (v) =>
          (entityTypeFilter === 'All' || v.entityType === entityTypeFilter) &&
          (categoryFilter === 'All' || v.vendorCategory === categoryFilter),
      ),
    [vendors, entityTypeFilter, categoryFilter],
  );
  const rows = useMemo(() => {
    const f = QUICK_FILTERS.find((q) => q.value === quickFilter) || QUICK_FILTERS[0];
    return narrowed.filter(f.match);
  }, [narrowed, quickFilter]);

  const filtersActive = quickFilter !== 'all' || entityTypeFilter !== 'All' || categoryFilter !== 'All';
  const clearFilters = () => {
    setQuickFilter('all');
    setEntityTypeFilter('All');
    setCategoryFilter('All');
  };

  const individuals = vendors.filter((v) => v.entityType === 'Individual').length;
  const relatedCount = vendors.filter(isRelated).length;
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const stats = [
    {
      label: 'Vendors',
      value: vendors.length,
      note: `${plural(vendors.length - individuals, 'organisation')} · ${plural(individuals, 'individual')}`,
    },
    { label: 'Active', value: vendors.filter(isActive).length, color: 'success.main' },
    { label: 'GST registered', value: vendors.filter(isGst).length },
    { label: 'MSME', value: vendors.filter(isMsme).length, note: 'Pay within 45 days' },
    {
      label: 'Related party',
      value: relatedCount,
      color: relatedCount ? 'warning.main' : undefined,
      note: relatedCount ? 'Extra compliance review' : undefined,
    },
  ];

  const selectSx = { minWidth: 160, '& .MuiInputBase-root': { height: 32, fontSize: 12.5 } };

  return (
    <>
      <PageHeader
        title="Vendor Register"
        subtitle="Suppliers, contractors and consultants the organisation pays"
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/vendor-registration/new')}>
              New vendor
            </Button>
          </PermissionGate>
        }
      />
      {vendors.length ? <StatStrip stats={stats} sx={{ mb: 2 }} /> : null}

      {/* Kept outside the DataTable: the table swaps to a loading state while a
          new search runs, which would otherwise unmount the search box. */}
      <Stack direction="row" sx={{ mb: 1.5, gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ width: { xs: '100%', sm: 300 }, mr: { sm: 1 } }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search name, code, PAN, contact…" />
        </Box>
        {QUICK_FILTERS.map((f) => {
          const selected = quickFilter === f.value;
          const count = narrowed.filter(f.match).length;
          if (count === 0 && !selected && f.value !== 'all' && f.value !== 'active') return null;
          return (
            <Chip
              key={f.value}
              size="small"
              label={`${f.label} · ${count}`}
              onClick={() => setQuickFilter(f.value)}
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              aria-pressed={selected}
            />
          );
        })}
        <Box sx={{ flex: 1 }} />
        <TextField
          select
          size="small"
          value={entityTypeFilter}
          onChange={(e) => setEntityTypeFilter(e.target.value)}
          sx={selectSx}
          slotProps={{ htmlInput: { 'aria-label': 'Entity type' } }}
        >
          <MenuItem value="All">All entity types</MenuItem>
          <MenuItem value="Individual">Individual</MenuItem>
          {ENTITY_TYPE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={selectSx}
          slotProps={{ htmlInput: { 'aria-label': 'Category' } }}
        >
          <MenuItem value="All">All categories</MenuItem>
          {VENDOR_CATEGORY_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
        {filtersActive ? (
          <Link component="button" type="button" variant="caption" onClick={clearFilters} sx={{ ml: 0.5 }}>
            Clear filters
          </Link>
        ) : null}
      </Stack>

      <DataTable
        dense
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        defaultSort={{ key: 'vendorCode', direction: 'asc' }}
        isLoading={vendorsQuery.isPending && !shown}
        error={vendorsQuery.isError ? vendorsQuery.error : null}
        onRetry={vendorsQuery.refetch}
        onRowClick={(r) => navigate(`/vendor-registration/${r.id}`)}
        emptyTitle={vendors.length ? 'No vendors match these filters' : 'No vendors registered'}
        emptyDescription={
          vendors.length ? 'Change the filters above, or clear them.' : 'Register the first vendor to see it here.'
        }
      />
    </>
  );
}
