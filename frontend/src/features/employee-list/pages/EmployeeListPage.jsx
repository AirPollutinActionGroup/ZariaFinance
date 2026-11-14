import { useMemo, useState } from 'react';
import { Box, Button, Chip, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { DataTable, PageHeader, SearchField, StatStrip, StatusChip } from '../../../shared/components/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useEmployees } from '../hooks/useEmployees.js';
import { EMPLOYEE_STATUS_TONE } from '../constants.js';

const statusOf = (emp) => emp.status || 'Active';
const isInactive = (emp) => statusOf(emp).startsWith('Inactive');

/** Status filter chips; `match` decides which employees each one shows. */
const STATUS_FILTERS = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'active', label: 'Active', match: (e) => statusOf(e) === 'Active' },
  { key: 'notice', label: 'On notice', match: (e) => statusOf(e) === 'On Notice' },
  { key: 'inactive', label: 'Inactive', match: isInactive },
];

/** Compact select used for the Department / Bucket / Type filters. */
function FilterSelect({ value, onChange, allLabel, options }) {
  return (
    <Select
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{ minWidth: 130, '& .MuiSelect-select': { py: 0.75, fontSize: 13.5 } }}
    >
      <MenuItem value="All">{allLabel}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  );
}

const columns = [
  {
    key: 'name',
    header: 'Employee',
    sortValue: (r) => r.name,
    render: (r) => (
      <Box sx={{ minWidth: 150 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
          {r.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
          <Box component="span" sx={{ fontFamily: 'monospace' }}>{r.empId}</Box> · since {formatDate(r.joiningDate)}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'designationName',
    header: 'Role',
    sortValue: (r) => r.designationName,
    render: (r) => (
      <Box sx={{ minWidth: 130 }}>
        <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
          {r.designationName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {r.departmentName}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'bucket',
    header: 'Bucket · Type',
    sortValue: (r) => r.bucket,
    sx: { whiteSpace: 'nowrap' },
    render: (r) => (
      <>
        <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
          {r.bucket}
        </Typography>
        <Typography variant="caption" color={r.employmentType === 'Contract' ? 'warning.main' : 'text.secondary'}>
          {r.employmentType}
        </Typography>
      </>
    ),
  },
  {
    key: 'location',
    header: 'Location',
    sortValue: (r) => (r.stateNames || [])[0],
    render: (r) => (
      <Box>
        <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
          {(r.stateNames || []).join(', ') || '—'}
        </Typography>
        {(r.cityNames || []).length ? (
          <Typography variant="caption" color="text.secondary">
            {r.cityNames.join(', ')}
          </Typography>
        ) : null}
      </Box>
    ),
  },
  {
    key: 'annualCtc',
    header: 'Annual CTC',
    align: 'right',
    sx: { whiteSpace: 'nowrap', fontWeight: 600 },
    sortValue: (r) => Number(r.annualCtc) || 0,
    render: (r) => `₹${Number(r.annualCtc).toLocaleString('en-IN')}`,
  },
  {
    key: 'status',
    header: 'Status',
    sx: { whiteSpace: 'nowrap' },
    sortValue: (r) => statusOf(r),
    render: (r) => (
      <Stack spacing={0.25} alignItems="flex-start">
        <StatusChip label={statusOf(r)} tone={EMPLOYEE_STATUS_TONE[statusOf(r)] || 'neutral'} />
        {r.exitDate ? (
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            Exit {formatDate(r.exitDate)}
          </Typography>
        ) : null}
      </Stack>
    ),
  },
];

/** Employee Master — /employee-list. */
export function EmployeeListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [bucketFilter, setBucketFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const employeesQuery = useEmployees();

  const employees = useMemo(() => employeesQuery.data || [], [employeesQuery.data]);
  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.departmentName))).filter(Boolean).sort(),
    [employees],
  );
  const buckets = useMemo(() => Array.from(new Set(employees.map((e) => e.bucket))).filter(Boolean).sort(), [employees]);

  // Everything except the status chips — the chips show counts within this set.
  const baseFiltered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return employees.filter((emp) => {
      const matchesSearch =
        !term ||
        [emp.empId, emp.name, emp.designationName, emp.departmentName, ...(emp.stateNames || []), ...(emp.cityNames || [])]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(term));
      return (
        matchesSearch &&
        (departmentFilter === 'All' || emp.departmentName === departmentFilter) &&
        (bucketFilter === 'All' || emp.bucket === bucketFilter) &&
        (typeFilter === 'All' || emp.employmentType === typeFilter)
      );
    });
  }, [employees, search, departmentFilter, bucketFilter, typeFilter]);

  const rows = useMemo(() => {
    const filter = STATUS_FILTERS.find((f) => f.key === statusFilter) || STATUS_FILTERS[0];
    return baseFiltered.filter(filter.match);
  }, [baseFiltered, statusFilter]);

  const current = employees.filter((e) => !isInactive(e));
  const stats = [
    { label: 'Employees', value: employees.length },
    { label: 'Active', value: employees.filter((e) => statusOf(e) === 'Active').length, color: 'success.main' },
    {
      label: 'Permanent · Contract',
      value: `${current.filter((e) => e.employmentType === 'Permanent').length} · ${
        current.filter((e) => e.employmentType === 'Contract').length
      }`,
      note: 'Current staff',
    },
    {
      label: 'Annual CTC',
      value: formatInr(current.reduce((sum, e) => sum + (Number(e.annualCtc) || 0), 0)),
      note: 'Current staff',
    },
  ];

  const filtersActive = departmentFilter !== 'All' || bucketFilter !== 'All' || typeFilter !== 'All' || search.trim();

  return (
    <>
      <PageHeader
        title="Employee Master"
        subtitle="Department and state map to F4 cost centres; bucket decides the F3 ledger"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/employee-list/new')}>
            Add Employee
          </Button>
        }
      />

      {employees.length ? <StatStrip stats={stats} sx={{ mb: 2 }} /> : null}

      <Stack direction="row" sx={{ mb: 1, gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ width: { xs: '100%', sm: 280 }, mr: { sm: 1 } }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search name, ID, role, place…" />
        </Box>
        {STATUS_FILTERS.map((f) => {
          const selected = statusFilter === f.key;
          return (
            <Chip
              key={f.key}
              size="small"
              label={`${f.label} · ${baseFiltered.filter(f.match).length}`}
              onClick={() => setStatusFilter(f.key)}
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              aria-pressed={selected}
            />
          );
        })}
      </Stack>
      <Stack direction="row" sx={{ mb: 1.5, gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <FilterSelect value={departmentFilter} onChange={setDepartmentFilter} allLabel="All departments" options={departments} />
        <FilterSelect value={bucketFilter} onChange={setBucketFilter} allLabel="All buckets" options={buckets} />
        <FilterSelect value={typeFilter} onChange={setTypeFilter} allLabel="All types" options={['Permanent', 'Contract']} />
        {filtersActive ? (
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              setSearch('');
              setDepartmentFilter('All');
              setBucketFilter('All');
              setTypeFilter('All');
            }}
          >
            Clear filters
          </Button>
        ) : null}
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          Showing {rows.length} of {employees.length}
        </Typography>
      </Stack>

      <DataTable
        dense
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        isLoading={employeesQuery.isPending}
        error={employeesQuery.isError ? employeesQuery.error : null}
        onRetry={employeesQuery.refetch}
        onRowClick={(r) => navigate(`/employee-list/${r.id}`)}
        emptyTitle={employees.length ? 'No employees match these filters' : 'No employees yet'}
        emptyDescription={employees.length ? 'Try another status or clear the filters.' : 'Add the first employee to see them here.'}
      />
    </>
  );
}
