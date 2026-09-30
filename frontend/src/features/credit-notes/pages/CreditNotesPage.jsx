import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  Grid,
  MenuItem,
  Stack,
  TableCell,
  TableFooter,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { useNavigate } from 'react-router-dom';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { downloadCsv, toCsv } from '../../../lib/export/csv.js';
import { useFinancialYears } from '../../financial-year/hooks/useFinancialYears.js';
import { BOOK_TONE } from '../../donation-management/constants.js';
import { BOOKS } from '../../donor-management/lib/donorBook.js';
import { useCreditNotes } from '../hooks/useCreditNotes.js';
import { MONEY_SX } from '../components/NoteLayout.jsx';
import { CreditSummaryCard } from '../components/CreditSummaryCard.jsx';
import { summarizeCreditNotes } from '../lib/summarizeCreditNotes.js';
import { donorsOf, EMPTY_FILTERS, filterCreditNotes, hasActiveFilters } from '../lib/filterCreditNotes.js';

/** All credit notes — /credit-notes. Money that came back, optionally returned to a donor fund. */
export function CreditNotesPage() {
  const navigate = useNavigate();
  const notesQuery = useCreditNotes();
  const notes = useMemo(() => notesQuery.data || [], [notesQuery.data]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // Financial year: null = not touched yet, so it follows the year marked
  // current; 'All' or an id once the user picks one.
  const [fyChoice, setFyChoice] = useState(null);
  const financialYearsQuery = useFinancialYears();
  const financialYears = useMemo(() => financialYearsQuery.data || [], [financialYearsQuery.data]);
  const currentFy = financialYears.find((fy) => fy.current) || null;
  const fyValue = fyChoice ?? (currentFy ? String(currentFy.id) : 'All');
  const selectedFy = financialYears.find((fy) => String(fy.id) === fyValue) || null;

  const donorOptions = useMemo(() => donorsOf(notes), [notes]);
  const filtered = useMemo(() => filterCreditNotes(notes, { ...filters, fy: selectedFy }), [notes, filters, selectedFy]);
  const setFilter = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }));
  const anyFilter = hasActiveFilters(filters) || fyChoice !== null;
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setFyChoice(null);
  };

  // The summary follows the filters, so it always describes the rows shown below.
  const summary = useMemo(() => summarizeCreditNotes(filtered), [filtered]);
  const filteredIssuedTotal = summary.issuedTotal;

  const handleExport = () => {
    const csv = toCsv(
      [
        { header: 'Credit note', value: (n) => n.id },
        { header: 'Date received', value: (n) => n.date },
        { header: 'Book', value: (n) => n.book },
        { header: 'Donor', value: (n) => n.donor?.name },
        { header: 'Fund profile', value: (n) => n.fundProfile?.name },
        { header: 'Grant agreement', value: (n) => n.grant?.name },
        { header: 'Disbursement type', value: (n) => n.disbursementType },
        { header: 'Tranche', value: (n) => n.tranche?.name },
        { header: 'Received via', value: (n) => n.paymentMode?.name },
        { header: 'Into bank account', value: (n) => n.bankAccount?.name },
        { header: 'Group', value: (n) => n.group?.name },
        { header: 'Ledger / payment type', value: (n) => n.ledger?.name },
        { header: 'Reference', value: (n) => n.reference },
        { header: 'Remarks', value: (n) => n.remarks },
        { header: 'Attachment', value: (n) => n.attachment?.name },
        { header: 'Amount (INR)', value: (n) => n.amount },
        { header: 'Issued by', value: (n) => n.createdBy },
      ],
      filtered,
    );
    downloadCsv(`credit-notes-${new Date().toLocaleDateString('en-CA')}.csv`, csv);
  };

  const columns = [
    {
      key: 'id',
      header: 'Credit note',
      sortValue: (n) => n.date,
      render: (n) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 12.5 }}>{n.id}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDate(n.date)}</Typography>
        </Box>
      ),
    },
    {
      key: 'fund',
      header: 'Fund & Grant',
      sortValue: (n) => n.fundProfile?.name || null,
      render: (n) =>
        n.fundProfile || n.donor ? (
          <Box>
            <Typography variant="body2">{n.fundProfile?.name || '—'}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {[n.donor?.name, n.grant?.name].filter(Boolean).join(' · ')}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Not returned to a fund
          </Typography>
        ),
    },
    {
      key: 'disbursement',
      header: 'Disbursement',
      sortValue: (n) => n.disbursementType || null,
      render: (n) =>
        n.disbursementType ? (
          <Box>
            <StatusChip label={n.disbursementType} tone={n.disbursementType === 'Tranches' ? 'info' : 'neutral'} />
            {n.tranche ? (
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>{n.tranche.name}</Typography>
            ) : null}
          </Box>
        ) : (
          '—'
        ),
    },
    {
      key: 'receipt',
      header: 'Received via',
      sortValue: (n) => n.paymentMode?.name,
      render: (n) => (
        <Box>
          <Typography variant="body2">{n.paymentMode?.name || '—'}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {[n.bankAccount?.name, n.reference].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'book',
      header: 'Book',
      sortValue: (n) => n.book,
      render: (n) => (n.book ? <StatusChip label={n.book} tone={BOOK_TONE[n.book]} /> : '—'),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortValue: (n) => n.amount,
      render: (n) => (
        <Box sx={{ ...MONEY_SX, fontWeight: 700, color: 'success.main' }}>
          {formatInrExact(n.amount)}
        </Box>
      ),
    },
  ];

  const footer =
    filtered.length > 0 ? (
      <TableFooter>
        <TableRow sx={{ '& td': { borderBottom: 'none', bgcolor: 'var(--card2)', color: 'text.primary', fontSize: 13 } }}>
          <TableCell colSpan={5} sx={{ fontWeight: 600 }}>
            Total · {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
          </TableCell>
          <TableCell align="right" sx={{ ...MONEY_SX, fontWeight: 700, color: 'success.main' }}>
            {formatInrExact(filteredIssuedTotal)}
          </TableCell>
        </TableRow>
      </TableFooter>
    ) : null;

  return (
    <Box sx={{ maxWidth: 1400 }}>
      <PageHeader
        title="Credit Notes"
        subtitle="Money that came back — refunds, reversed overcharges, rebates — and the donor fund it was returned to."
        actions={
          <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => navigate('/credit-notes/new')}>
            New credit note
          </Button>
        }
      />

      <CreditSummaryCard
        summary={summary}
        period={selectedFy ? `FY ${selectedFy.code} · ${formatDate(selectedFy.startDate)} – ${formatDate(selectedFy.endDate)}` : 'All financial years'}
        filtered={anyFilter}
        totalCount={notes.length}
        onClearFilters={clearFilters}
      />

      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <SearchField placeholder="Search note no., fund, tranche, reference…" value={filters.query} onChange={setFilter('query')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Autocomplete
              size="small"
              options={donorOptions}
              value={filters.donor}
              onChange={(_, donor) => setFilter('donor')(donor || null)}
              getOptionLabel={(d) => d.name}
              isOptionEqualToValue={(a, b) => String(a.id ?? a.name) === String(b.id ?? b.name)}
              renderInput={(params) => <TextField {...params} placeholder="All donors" />}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField select fullWidth size="small" value={filters.book} onChange={(e) => setFilter('book')(e.target.value)}>
              <MenuItem value="All">All Books</MenuItem>
              {BOOKS.map((b) => (
                <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Financial year"
              value={fyValue}
              onChange={(e) => setFyChoice(e.target.value)}
              disabled={financialYearsQuery.isLoading}
              helperText={financialYearsQuery.isError ? "Couldn't load financial years" : undefined}
              error={financialYearsQuery.isError}
            >
              <MenuItem value="All">All Financial Years</MenuItem>
              {financialYears.map((fy) => (
                <MenuItem key={fy.id} value={String(fy.id)}>
                  {fy.code}
                  {fy.current ? ' (current)' : ''}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="From"
              value={filters.from}
              onChange={(e) => setFilter('from')(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: filters.to || undefined } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="To"
              value={filters.to}
              onChange={(e) => setFilter('to')(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: filters.from || undefined } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack direction="row" spacing={1} justifyContent={{ sm: 'flex-end' }}>
              {anyFilter ? (
                <Button size="small" color="inherit" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null}
              <Button size="small" variant="outlined" startIcon={<FileDownloadOutlinedIcon />} onClick={handleExport} disabled={!filtered.length}>
                Export CSV
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Card>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowKey={(n) => n.id}
        isLoading={notesQuery.isPending}
        error={notesQuery.isError ? notesQuery.error : null}
        onRetry={notesQuery.refetch}
        defaultSort={{ key: 'id', direction: 'desc' }}
        footer={footer}
        onRowClick={(n) => navigate(`/credit-notes/${n.id}`)}
        emptyTitle={notes.length ? 'No credit notes match these filters' : 'No credit notes yet'}
        emptyDescription={
          !notes.length
            ? 'Raise a credit note when money comes back — a refund, a rebate.'
            : selectedFy && !hasActiveFilters(filters)
              ? `Nothing recorded in FY ${selectedFy.code} — pick another financial year or All Financial Years.`
              : 'Try another financial year, widening the date range, or clearing filters.'
        }
      />
    </Box>
  );
}
