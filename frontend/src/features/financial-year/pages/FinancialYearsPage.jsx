import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ConfirmDialog, DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { FINANCIAL_YEAR_STATUS_LABEL } from '../constants.js';
import { useFinancialYears, useCreateFinancialYear, useSetCurrentFinancialYear } from '../hooks/useFinancialYears.js';

// Given a start date, suggest an "FY YYYY-YY" label following the Apr–Mar cycle
function suggestCode(startDate) {
  if (!startDate) return '';
  const [y, m] = startDate.split('-').map(Number);
  const fyStartYear = m >= 4 ? y : y - 1;
  return `FY ${fyStartYear}-${String((fyStartYear + 1) % 100).padStart(2, '0')}`;
}

// Given a start date, suggest an end date of 31 March the following year
function suggestEndDate(startDate) {
  if (!startDate) return '';
  const [y, m] = startDate.split('-').map(Number);
  const endYear = m >= 4 ? y + 1 : y;
  return `${endYear}-03-31`;
}

function formatDate(value) {
  if (!value) return '—';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const STATUS_COLORS = {
  ACTIVE: { bg: '#E6F4EE', color: '#0F7B4D', border: '#B4E2D0' },
  UPCOMING: { bg: '#EEF2F6', color: '#1D4ED8', border: '#BFDBFE' },
  CLOSED: { bg: '#F6F7F8', color: '#6F747D', border: '#DFE1E5' },
};

export function FinancialYearsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [itemToSetCurrent, setItemToSetCurrent] = useState(null);

  // Add Financial Year Dialog State
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [codeTouched, setCodeTouched] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newIsCurrent, setNewIsCurrent] = useState(false);

  const financialYearsQuery = useFinancialYears();
  const createFinancialYear = useCreateFinancialYear();
  const setCurrentFinancialYear = useSetCurrentFinancialYear();

  const financialYears = useMemo(() => financialYearsQuery.data || [], [financialYearsQuery.data]);

  const formError = useMemo(() => {
    if (!newStartDate || !newEndDate) return null;
    if (newEndDate < newStartDate) return 'End date cannot be before the start date.';
    const overlap = financialYears.find(
      (fy) => newStartDate <= fy.endDate && fy.startDate <= newEndDate
    );
    if (overlap) return `This period overlaps with ${overlap.code}.`;
    const dupCode = financialYears.find(
      (fy) => fy.code.toLowerCase() === newCode.trim().toLowerCase()
    );
    if (dupCode) return `${newCode.trim()} already exists on record.`;
    return null;
  }, [financialYears, newCode, newStartDate, newEndDate]);

  const isCreateValid =
    newCode.trim() && newStartDate && newEndDate && !formError;

  // Filtered Data
  const filteredFinancialYears = useMemo(() => {
    return financialYears
      .filter((fy) => {
        const matchesSearch = fy.code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || fy.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .map((fy, index) => ({ ...fy, srNo: index + 1 }));
  }, [financialYears, searchQuery, statusFilter]);

  const handleStartDateChange = (value) => {
    setNewStartDate(value);
    if (!codeTouched) setNewCode(suggestCode(value));
    if (!newEndDate) setNewEndDate(suggestEndDate(value));
  };

  // Handle Set as Current via Confirmation Dialog
  const handleConfirmSetCurrent = async () => {
    if (!itemToSetCurrent) return;
    await setCurrentFinancialYear.mutateAsync(itemToSetCurrent.id);
    setItemToSetCurrent(null);
  };

  // Handle Add New Financial Year
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!isCreateValid) return;

    await createFinancialYear.mutateAsync({
      code: newCode,
      startDate: newStartDate,
      endDate: newEndDate,
      current: newIsCurrent,
    });

    setNewCode('');
    setCodeTouched(false);
    setNewStartDate('');
    setNewEndDate('');
    setNewIsCurrent(false);
    setOpenCreateDialog(false);
  };

  // Table Columns
  const columns = [
    {
      key: 'srNo',
      header: 'SR NO',
      width: '10%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', pl: 1 }}>
          {row.srNo}
        </Typography>
      ),
    },
    {
      key: 'code',
      header: 'FINANCIAL YEAR',
      width: '20%',
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {row.code}
        </Typography>
      ),
    },
    {
      key: 'period',
      header: 'PERIOD',
      width: '25%',
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {formatDate(row.startDate)} — {formatDate(row.endDate)}
        </Typography>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '15%',
      render: (row) => {
        const palette = STATUS_COLORS[row.status] || STATUS_COLORS.CLOSED;
        return (
          <Box
            sx={{
              display: 'inline-block',
              px: 1.2,
              py: 0.4,
              borderRadius: '6px',
              fontSize: 12.5,
              fontWeight: 700,
              bgcolor: palette.bg,
              color: palette.color,
              border: '1px solid',
              borderColor: palette.border,
            }}
          >
            {row.statusLabel || FINANCIAL_YEAR_STATUS_LABEL[row.status] || row.status}
          </Box>
        );
      },
    },
    {
      key: 'current',
      header: 'CURRENT',
      width: '30%',
      render: (row) =>
        row.current ? (
          <Chip
            label="Current"
            size="small"
            sx={{ bgcolor: '#F2E041', color: '#17191C', fontWeight: 700 }}
          />
        ) : (
          <Button
            size="small"
            variant="outlined"
            onClick={() => setItemToSetCurrent(row)}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
          >
            Set as Current
          </Button>
        ),
    },
  ];

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <PageHeader
        title="Financial Year"
        subtitle="Manage financial year periods and the currently active year"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              bgcolor: '#17191C',
              color: '#FFFFFF',
              fontWeight: 600,
              px: 2.5,
              '&:hover': { bgcolor: '#232629' },
            }}
          >
            Add Financial Year
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box sx={{ width: { xs: '100%', sm: 380 } }}>
          <SearchField
            placeholder="Search financial years…"
            value={searchQuery}
            onChange={(val) => setSearchQuery(val)}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            displayEmpty
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="All">All Statuses</MenuItem>
            <MenuItem value="ACTIVE">Active Only</MenuItem>
            <MenuItem value="UPCOMING">Upcoming Only</MenuItem>
            <MenuItem value="CLOSED">Closed Only</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filteredFinancialYears}
        getRowKey={(row) => row.id}
        isLoading={financialYearsQuery.isPending}
        error={financialYearsQuery.isError ? financialYearsQuery.error : null}
        onRetry={financialYearsQuery.refetch}
        emptyTitle="No financial years found"
        emptyDescription="Try adjusting your search query or filter."
      />

      {/* Add Financial Year Modal Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <form onSubmit={handleCreateSubmit}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            Add Financial Year
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Start Date *"
                type="date"
                value={newStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="End Date *"
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Financial Year Label *"
                placeholder="e.g. FY 2026-27"
                value={newCode}
                onChange={(e) => {
                  setNewCode(e.target.value);
                  setCodeTouched(true);
                }}
                helperText="Auto-suggested from the start date — override if needed."
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={newIsCurrent}
                    onChange={(e) => setNewIsCurrent(e.target.checked)}
                  />
                }
                label="Set as current financial year"
              />

              {formError ? (
                <Typography variant="body2" color="error">
                  {formError}
                </Typography>
              ) : null}

              {createFinancialYear.isError ? (
                <Typography variant="body2" color="error">
                  {createFinancialYear.error?.message || 'Could not save the financial year.'}
                </Typography>
              ) : null}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenCreateDialog(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!isCreateValid || createFinancialYear.isPending}
              sx={{
                bgcolor: '#17191C',
                color: '#FFFFFF',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { bgcolor: '#232629' },
              }}
            >
              Save Financial Year
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Set as Current Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(itemToSetCurrent)}
        title="Set Current Financial Year"
        description={`Are you sure you want to set "${itemToSetCurrent?.code}" as the current financial year? This will replace the existing current year.`}
        confirmLabel="Set as Current"
        confirmColor="primary"
        onConfirm={handleConfirmSetCurrent}
        onClose={() => setItemToSetCurrent(null)}
      />
    </Box>
  );
}
