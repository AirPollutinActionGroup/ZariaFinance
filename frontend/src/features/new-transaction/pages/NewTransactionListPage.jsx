import { useState } from 'react';
import { Box, Button, Chip, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { formatInr } from '../../../lib/format/currency.js';
import { MOCK_TRANSACTIONS } from '../data/mockNewTransaction.js';

export function NewTransactionListPage() {
  const navigate = useNavigate();
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [bookFilter, setBookFilter] = useState('All');

  const books = Array.from(new Set(transactions.map((t) => t.book))).filter(Boolean);

  const filteredTransactions = transactions.filter((tx) => {
    const query = search.toLowerCase();
    const matchesSearch =
      tx.id.toLowerCase().includes(query) ||
      tx.partyName.toLowerCase().includes(query) ||
      tx.donorName.toLowerCase().includes(query) ||
      tx.fundName.toLowerCase().includes(query);

    const matchesType = typeFilter === 'All' || tx.type === typeFilter;
    const matchesBook = bookFilter === 'All' || tx.book === bookFilter;

    return matchesSearch && matchesType && matchesBook;
  });

  const columns = [
    {
      key: 'id',
      header: 'Transaction ID',
      width: 140,
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
          {r.id}
        </Typography>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      width: 110,
      render: (r) => r.date,
    },
    {
      key: 'type',
      header: 'Type',
      width: 110,
      render: (r) => (
        <Chip
          label={r.type === 'DEBIT' ? 'Debit (Out)' : 'Credit (In)'}
          size="small"
          color={r.type === 'DEBIT' ? 'error' : 'success'}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      key: 'book',
      header: 'Book',
      width: 70,
      render: (r) => r.book,
    },
    {
      key: 'partyName',
      header: 'Payee / Donor',
      width: 220,
      render: (r) => <b>{r.partyName}</b>,
    },
    {
      key: 'fundName',
      header: 'Fund',
      width: 180,
      render: (r) => r.fundName,
    },
    {
      key: 'paymentModeLabel',
      header: 'Payment Mode',
      width: 130,
      render: (r) => r.paymentModeLabel,
    },
    {
      key: 'amount',
      header: 'Amount',
      width: 130,
      align: 'right',
      render: (r) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color: r.type === 'DEBIT' ? 'error.main' : 'success.main' }}
        >
          {r.type === 'DEBIT' ? '−' : '+'}
          {formatInr(r.amount)}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Payment Window(Cr/Dr)"
        subtitle="Donor receipts and programme disbursements recorded through the New Transaction form."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/new-transaction/new')}
          >
            New Transaction
          </Button>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 320, flex: 1, minWidth: 200 }}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by ID, payee, donor, fund…"
          />
        </Box>

        <Select
          size="small"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          sx={{ minWidth: 150, borderRadius: 2 }}
        >
          <MenuItem value="All">All Types</MenuItem>
          <MenuItem value="DEBIT">Debit (Out)</MenuItem>
          <MenuItem value="CREDIT">Credit (In)</MenuItem>
        </Select>

        <Select
          size="small"
          value={bookFilter}
          onChange={(e) => setBookFilter(e.target.value)}
          sx={{ minWidth: 130, borderRadius: 2 }}
        >
          <MenuItem value="All">All Books</MenuItem>
          {books.map((book) => (
            <MenuItem key={book} value={book}>
              {book}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <DataTable
        columns={columns}
        rows={filteredTransactions}
        getRowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/new-transaction/${r.id}`)}
        emptyTitle="No transactions found"
      />
    </>
  );
}
