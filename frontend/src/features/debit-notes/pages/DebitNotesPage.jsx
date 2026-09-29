import { useMemo, useState } from 'react';
import {
  Alert,
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
import { useAuth } from '../../../core/auth/index.js';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { downloadCsv, toCsv } from '../../../lib/export/csv.js';
import { useFinancialYears } from '../../financial-year/hooks/useFinancialYears.js';
import { getOutflowRows } from '../../outflow-budget/data/outflowRepository.js';
import { BOOK_TONE } from '../../donation-management/constants.js';
import { BOOKS, PAYEE_CATEGORIES } from '../../new-transaction/data/mockNewTransaction.js';
import { cancelDebitNote, getDebitNotes } from '../data/debitNoteRepository.js';
import { creditTotalsByDebitNote, getCreditNotes } from '../../credit-notes/data/creditNoteRepository.js';
import { MONEY_SX } from '../../credit-notes/components/NoteLayout.jsx';
import { CancelDebitNoteDialog } from '../components/CancelDebitNoteDialog.jsx';
import { DebitSummaryCard } from '../components/DebitSummaryCard.jsx';
import { summarizeDebitNotes } from '../lib/summarizeDebitNotes.js';
import { donorsOf, EMPTY_FILTERS, filterDebitNotes, hasActiveFilters } from '../lib/filterDebitNotes.js';
import { DEBIT_NOTE_REASON, DEBIT_NOTE_STATUS, DEBIT_NOTE_STATUS_TONE, reasonLabel } from '../constants.js';

const payeeCategoryLabel = (code) => PAYEE_CATEGORIES.find((c) => c.value === code)?.label || '';

/** All debit notes — /debit-notes. Issued notes add to Spent on the Outflow Budget. */
export function DebitNotesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState(() => getDebitNotes());
  const [lines] = useState(() => getOutflowRows());
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [message, setMessage] = useState(null);
  const [creditedByDebit] = useState(() => creditTotalsByDebitNote(getCreditNotes()));

  // Financial year: null = not touched yet, so it follows the year marked current
  // (as on the Payment Window); 'All' or an id once the user picks one.
  const [fyChoice, setFyChoice] = useState(null);
  const financialYearsQuery = useFinancialYears();
  const financialYears = useMemo(() => financialYearsQuery.data || [], [financialYearsQuery.data]);
  const currentFy = financialYears.find((fy) => fy.current) || null;
  const fyValue = fyChoice ?? (currentFy ? String(currentFy.id) : 'All');
  const selectedFy = financialYears.find((fy) => String(fy.id) === fyValue) || null;

  const lineById = useMemo(() => Object.fromEntries(lines.map((l) => [l.id, l])), [lines]);
  const donorOptions = useMemo(() => donorsOf(notes), [notes]);
  const filtered = useMemo(
    () => filterDebitNotes(notes, { ...filters, fy: selectedFy }, lineById),
    [notes, filters, selectedFy, lineById],
  );
  const setFilter = (key) => (value) => setFilters((f) => ({ ...f, [key]: value }));
  const anyFilter = hasActiveFilters(filters) || fyChoice !== null;
  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setFyChoice(null);
  };

  // The summary follows the filters, so it always describes the rows shown below.
  const summary = useMemo(() => summarizeDebitNotes(filtered, creditedByDebit), [filtered, creditedByDebit]);

  const handleCancel = (reason) => {
    cancelDebitNote(cancelTarget.id, { by: user?.name || 'You', note: reason });
    setNotes(getDebitNotes());
    setMessage(`${cancelTarget.id} cancelled — ${formatInrExact(cancelTarget.amount)} removed from Spent on ${cancelTarget.outflowLineId}.`);
    setCancelTarget(null);
  };

  const handleExport = () => {
    const csv = toCsv(
      [
        { header: 'Debit note', value: (n) => n.id },
        { header: 'Date', value: (n) => n.date },
        { header: 'Book', value: (n) => n.book },
        { header: 'Outflow line', value: (n) => n.outflowLineId },
        { header: 'Line description', value: (n) => lineById[n.outflowLineId]?.line || '' },
        { header: 'Reason', value: (n) => reasonLabel(n.reason) },
        { header: 'Payee category', value: (n) => payeeCategoryLabel(n.payeeCategory) },
        { header: 'Payee', value: (n) => n.payee?.name },
        { header: 'Payment mode', value: (n) => n.paymentMode?.name },
        { header: 'Bank account', value: (n) => n.bankAccount?.name },
        { header: 'Reference', value: (n) => n.reference },
        { header: 'Group', value: (n) => n.group?.name },
        { header: 'Ledger / payment type', value: (n) => n.ledger?.name },
        { header: 'Donor', value: (n) => n.donor?.name },
        { header: 'Fund profile', value: (n) => n.fundProfile?.name },
        { header: 'Grant agreement', value: (n) => n.grant?.name },
        { header: 'Remarks', value: (n) => n.remarks },
        { header: 'Attachment', value: (n) => n.attachment?.name },
        { header: 'Amount (INR)', value: (n) => n.amount },
        { header: 'Credited back (INR)', value: (n) => creditedByDebit[n.id] || 0 },
        { header: 'Status', value: (n) => DEBIT_NOTE_STATUS[n.status] },
        { header: 'Issued by', value: (n) => n.createdBy },
        { header: 'Cancelled by', value: (n) => n.cancelledBy || '' },
      ],
      filtered,
    );
    downloadCsv(`debit-notes-${new Date().toLocaleDateString('en-CA')}.csv`, csv);
  };

  const columns = [
    {
      key: 'id',
      header: 'Debit note',
      sortValue: (n) => n.date,
      render: (n) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 12.5 }}>{n.id}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDate(n.date)}</Typography>
        </Box>
      ),
    },
    {
      key: 'outflowLineId',
      header: 'Outflow line',
      sortValue: (n) => n.outflowLineId,
      render: (n) => (
        <Box>
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: 12.5 }}>{n.outflowLineId}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {lineById[n.outflowLineId]?.line || 'Unknown line'}
          </Typography>
          {n.reason ? (
            <Typography variant="caption" sx={{ color: 'warning.main', display: 'block', fontWeight: 600 }}>
              Over budget · {reasonLabel(n.reason)}
            </Typography>
          ) : null}
        </Box>
      ),
    },
    {
      key: 'payee',
      header: 'Payee',
      sortValue: (n) => n.payee?.name,
      render: (n) => (
        <Box>
          <Typography variant="body2">{n.payee?.name || '—'}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {[payeeCategoryLabel(n.payeeCategory), n.paymentMode?.name, n.reference].filter(Boolean).join(' · ')}
          </Typography>
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
          <Typography variant="body2" color="text.secondary">Not charged to a fund</Typography>
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
        <Box>
          <Box sx={{ ...MONEY_SX, fontWeight: 700, color: n.status === 'ISSUED' ? 'error.main' : 'text.secondary', textDecoration: n.status === 'CANCELLED' ? 'line-through' : 'none' }}>
            {formatInrExact(n.amount)}
          </Box>
          {creditedByDebit[n.id] ? (
            <Typography variant="caption" sx={{ ...MONEY_SX, color: 'success.main', display: 'block' }}>
              − {formatInrExact(creditedByDebit[n.id])} credited
            </Typography>
          ) : null}
        </Box>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (n) => DEBIT_NOTE_STATUS[n.status],
      render: (n) => <StatusChip label={DEBIT_NOTE_STATUS[n.status]} tone={DEBIT_NOTE_STATUS_TONE[n.status]} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (n) =>
        n.status === 'ISSUED' ? (
          <Button
            size="small"
            color="inherit"
            // A credited debit note can't be cancelled until its credit notes are.
            disabled={Boolean(creditedByDebit[n.id])}
            title={creditedByDebit[n.id] ? 'Cancel its credit notes first' : undefined}
            onClick={(e) => {
              e.stopPropagation(); // don't open the detail page
              setCancelTarget(n);
            }}
          >
            Cancel
          </Button>
        ) : null,
    },
  ];

  const footer =
    filtered.length > 0 ? (
      <TableFooter>
        <TableRow sx={{ '& td': { borderBottom: 'none', bgcolor: 'var(--card2)', color: 'text.primary', fontSize: 13 } }}>
          <TableCell colSpan={5} sx={{ fontWeight: 600 }}>
            Total · {filtered.length} {filtered.length === 1 ? 'note' : 'notes'}
            <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
              (issued only — cancelled notes excluded)
            </Typography>
          </TableCell>
          <TableCell align="right" sx={{ ...MONEY_SX, fontWeight: 700, color: 'error.main' }}>
            {formatInrExact(summary.issuedTotal)}
          </TableCell>
          <TableCell colSpan={2} />
        </TableRow>
      </TableFooter>
    ) : null;

  return (
    <Box sx={{ maxWidth: 1400 }}>
      <PageHeader
        title="Debit Notes"
        subtitle="Extra money that went out against an outflow budget line — added to Spent, and optionally charged to a donor fund."
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button variant="outlined" onClick={() => navigate('/credit-notes')}>
              Credit Notes
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/debit-notes/new')}>
              New debit note
            </Button>
          </Stack>
        }
      />

      {message ? (
        <Alert severity="success" onClose={() => setMessage(null)} sx={{ mb: 3 }}>
          {message}
        </Alert>
      ) : null}

      <DebitSummaryCard
        summary={summary}
        period={selectedFy ? `FY ${selectedFy.code} · ${formatDate(selectedFy.startDate)} – ${formatDate(selectedFy.endDate)}` : 'All financial years'}
        filtered={anyFilter}
        totalCount={notes.length}
        onClearFilters={clearFilters}
      />

      <Card sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1.5} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <SearchField placeholder="Search note no., line, payee, fund, reference…" value={filters.query} onChange={setFilter('query')} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Autocomplete
              size="small"
              options={lines}
              value={filters.lineId ? lineById[filters.lineId] || null : null}
              onChange={(_, line) => setFilter('lineId')(line?.id || null)}
              getOptionLabel={(l) => `${l.id} — ${l.line}`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderInput={(params) => <TextField {...params} placeholder="All outflow lines" />}
            />
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
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField select fullWidth size="small" value={filters.reason} onChange={(e) => setFilter('reason')(e.target.value)}>
              <MenuItem value="All">All Reasons</MenuItem>
              {Object.entries(DEBIT_NOTE_REASON).map(([code, label]) => (
                <MenuItem key={code} value={code}>{label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField select fullWidth size="small" value={filters.status} onChange={(e) => setFilter('status')(e.target.value)}>
              <MenuItem value="All">All Statuses</MenuItem>
              {Object.entries(DEBIT_NOTE_STATUS).map(([code, label]) => (
                <MenuItem key={code} value={code}>{label}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 2 }}>
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
          <Grid size={12}>
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
        defaultSort={{ key: 'id', direction: 'desc' }}
        footer={footer}
        onRowClick={(n) => navigate(`/debit-notes/${n.id}`)}
        emptyTitle={notes.length ? 'No debit notes match these filters' : 'No debit notes yet'}
        emptyDescription={
          !notes.length
            ? 'Raise a debit note when extra money goes out against an outflow line.'
            : selectedFy && !hasActiveFilters(filters)
              ? `Nothing recorded in FY ${selectedFy.code} — pick another financial year or All Financial Years.`
              : 'Try another financial year, widening the date range, or clearing filters.'
        }
      />

      <CancelDebitNoteDialog key={cancelTarget?.id ?? 'none'} note={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancel} />
    </Box>
  );
}
