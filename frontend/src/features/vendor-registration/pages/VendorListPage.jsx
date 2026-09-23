import { useMemo, useState } from 'react';
import { Box, Button, Chip, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { useVendors } from '../hooks/useVendors.js';

export function VendorListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const vendorsQuery = useVendors(search);

  const vendors = vendorsQuery.data || [];
  const entityTypes = useMemo(
    () => Array.from(new Set(vendors.map((v) => v.entityType))).filter(Boolean),
    [vendors],
  );
  const categories = useMemo(
    () => Array.from(new Set(vendors.map((v) => v.vendorCategory))).filter(Boolean),
    [vendors],
  );

  const filteredVendors = vendors.filter((vendor) => {
    const matchesEntityType = entityTypeFilter === 'All' || vendor.entityType === entityTypeFilter;
    const matchesCategory = categoryFilter === 'All' || vendor.vendorCategory === categoryFilter;
    const matchesStatus =
      statusFilter === 'All' || (vendor.status || 'Active').toLowerCase() === statusFilter.toLowerCase();
    return matchesEntityType && matchesCategory && matchesStatus;
  });

  const columns = [
    {
      key: 'vendorCode',
      header: 'Vendor Code',
      width: 110,
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
          {r.vendorCode}
        </Typography>
      ),
    },
    {
      key: 'legalName',
      header: 'Legal Name',
      width: 220,
      render: (r) => <b>{r.legalName}</b>,
    },
    {
      key: 'entityType',
      header: 'Entity Type',
      width: 130,
      render: (r) => (
        <Chip label={r.entityType} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
      ),
    },
    {
      key: 'panNumber',
      header: 'PAN',
      width: 130,
      render: (r) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12.5 }}>
          {r.panNumber}
        </Typography>
      ),
    },
    {
      key: 'vendorCategory',
      header: 'Category',
      width: 140,
      render: (r) => r.vendorCategory,
    },
    {
      key: 'contactName',
      header: 'Contact',
      width: 160,
      render: (r) => r.contactName,
    },
    {
      key: 'state',
      header: 'State',
      width: 120,
      render: (r) => r.state,
    },
    {
      key: 'status',
      header: 'Status',
      width: 110,
      align: 'center',
      render: (r) => {
        const isActive = (r.status || 'Active') === 'Active';
        return (
          <Chip
            label={r.status || 'Active'}
            color={isActive ? 'success' : 'error'}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, minWidth: 75 }}
          />
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Vendor / Supplier Register"
        subtitle="Entity Type drives which identification, tax and document fields apply to each vendor."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/vendor-registration/new')}
          >
            Add Vendor
          </Button>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 320, flex: 1, minWidth: 200 }}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by code, name, PAN, contact…"
          />
        </Box>

        <Select
          size="small"
          value={entityTypeFilter}
          onChange={(e) => setEntityTypeFilter(e.target.value)}
          sx={{ minWidth: 150, borderRadius: 2 }}
        >
          <MenuItem value="All">All Entity Types</MenuItem>
          {entityTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>

        <Select
          size="small"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 150, borderRadius: 2 }}
        >
          <MenuItem value="All">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>

        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 130, borderRadius: 2 }}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </Select>
      </Stack>

      <DataTable
        columns={columns}
        rows={filteredVendors}
        getRowKey={(r) => r.id}
        isLoading={vendorsQuery.isPending}
        error={vendorsQuery.isError ? vendorsQuery.error : null}
        onRetry={vendorsQuery.refetch}
        onRowClick={(r) => navigate(`/vendor-registration/${r.id}`)}
        emptyTitle="No vendors found"
        emptyDescription="Register the first vendor to see it here."
      />
    </>
  );
}
