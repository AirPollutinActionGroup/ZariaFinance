import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { useEmployees } from '../hooks/useEmployees.js';

export function EmployeeListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [bucketFilter, setBucketFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const employeesQuery = useEmployees(search);

  const employees = employeesQuery.data || [];
  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.departmentName))).filter(Boolean),
    [employees],
  );
  const buckets = useMemo(
    () => Array.from(new Set(employees.map((e) => e.bucket))).filter(Boolean),
    [employees],
  );

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.empId.toLowerCase().includes(search.toLowerCase()) ||
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.designationName.toLowerCase().includes(search.toLowerCase()) ||
      emp.departmentName.toLowerCase().includes(search.toLowerCase()) ||
      emp.state.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      departmentFilter === 'All' || emp.departmentName === departmentFilter;

    const matchesType =
      typeFilter === 'All' || emp.employmentType.toLowerCase() === typeFilter.toLowerCase();

    const matchesBucket =
      bucketFilter === 'All' || emp.bucket.toLowerCase() === bucketFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'All' || (emp.status || 'Active').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDept && matchesType && matchesBucket && matchesStatus;
  });

  const columns = [
    {
      key: 'empId',
      header: 'Emp ID',
      width: 100,
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
          {r.empId}
        </Typography>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      width: 180,
      render: (r) => <b>{r.name}</b>,
    },
    {
      key: 'departmentName',
      header: 'Department (F4)',
      width: 180,
      render: (r) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12.5, fontWeight: 600 }}>
          {r.departmentName}
        </Typography>
      ),
    },
    {
      key: 'designationName',
      header: 'Designation',
      width: 220,
      render: (r) => r.designationName,
    },
    {
      key: 'bucket',
      header: 'Bucket',
      width: 110,
      render: (r) => r.bucket,
    },
    {
      key: 'state',
      header: 'State',
      width: 110,
      render: (r) => r.state,
    },
    {
      key: 'employmentType',
      header: 'Employment type',
      width: 150,
      align: 'center',
      render: (r) => (
        <Chip
          label={r.employmentType}
          size="small"
          variant="outlined"
          color={r.employmentType === 'Permanent' ? 'default' : 'secondary'}
          sx={{ fontWeight: 600, fontSize: 12 }}
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 120,
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
    {
      key: 'annualCtc',
      header: 'Annual CTC (Rs)',
      width: 150,
      align: 'right',
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
          {Number(r.annualCtc).toLocaleString('en-IN')}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Employee Master"
        subtitle="Department and state map to F4 cost centres. Bucket determines which F3 ledger the cost posts to."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/employee-list/new')}
          >
            Add Employee
          </Button>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 320, flex: 1, minWidth: 200 }}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by ID, name, designation, dept…"
          />
        </Box>

        <Select
          size="small"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          sx={{ minWidth: 150, borderRadius: 2 }}
        >
          <MenuItem value="All">All Departments</MenuItem>
          {departments.map((dept) => (
            <MenuItem key={dept} value={dept}>
              {dept}
            </MenuItem>
          ))}
        </Select>

        <Select
          size="small"
          value={bucketFilter}
          onChange={(e) => setBucketFilter(e.target.value)}
          sx={{ minWidth: 130, borderRadius: 2 }}
        >
          <MenuItem value="All">All Buckets</MenuItem>
          {buckets.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </Select>

        <Select
          size="small"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 140, borderRadius: 2 }}
        >
          <MenuItem value="All">All Types</MenuItem>
          <MenuItem value="Permanent">Permanent</MenuItem>
          <MenuItem value="Contract">Contract</MenuItem>
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
        rows={filteredEmployees}
        getRowKey={(r) => r.id}
        isLoading={employeesQuery.isPending}
        error={employeesQuery.isError ? employeesQuery.error : null}
        onRetry={employeesQuery.refetch}
        onRowClick={(r) => navigate(`/employee-list/${r.id}`)}
        emptyTitle="No employees found"
        emptyDescription="Add the first employee to see them here."
      />
    </>
  );
}
