import { useState } from 'react';
import { Box, Button, Card, Chip, MenuItem, Select, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';

const MOCK_DONATIONS = [
  {
    id: 1,
    code: 'ZRY/DN/2026/0001',
    date: '12 Apr 2026',
    donor: 'Rohan Kapadia',
    type: 'Major gift',
    amount: '₹25.00 L',
    fundMode: 'Restricted',
    location: 'Delhi',
    compliance: [
      { label: '80G', tone: 'ok' },
      { label: '10BD', tone: 'ok' },
      { label: 'FC', tone: 'no' },
      { label: '—', tone: 'no' },
    ],
    status: 'Income recognised',
    statusTone: 'success',
  },
  {
    id: 2,
    code: 'ZRY/DN/2026/0002',
    date: '18 Apr 2026',
    donor: 'Anonymous',
    type: 'One-time',
    amount: '₹2.50 L',
    fundMode: 'Unrestricted',
    location: 'Delhi',
    compliance: [
      { label: '80G', tone: 'no' },
      { label: '10BD', tone: 'no' },
      { label: 'FC', tone: 'no' },
      { label: '115', tone: 'alert' },
    ],
    status: 'Income recognised',
    statusTone: 'success',
  },
  {
    id: 3,
    code: 'ZRY/DN/2026/0003',
    date: '01 May 2026',
    donor: 'Horizon Global Fund',
    type: 'Major gift',
    amount: '₹10.08 L',
    subAmount: 'USD 12,000 @ 84.00',
    fundMode: 'Restricted',
    location: 'Rajasthan',
    compliance: [
      { label: '80G', tone: 'no' },
      { label: '10BD', tone: 'no' },
      { label: 'FC', tone: 'fcra' },
      { label: '—', tone: 'no' },
    ],
    status: 'Income recognised',
    statusTone: 'success',
  },
  {
    id: 4,
    code: 'ZRY/DN/2026/0004',
    date: '05 May 2026',
    donor: 'Meera Iyer',
    type: 'Recurring',
    amount: '₹5,000 / month',
    fundMode: 'Unrestricted',
    location: 'MP',
    compliance: [
      { label: '80G', tone: 'ok' },
      { label: '10BD', tone: 'ok' },
      { label: 'FC', tone: 'no' },
      { label: '—', tone: 'no' },
    ],
    status: 'Mandate active - 3 debits',
    statusTone: 'success',
  },
  {
    id: 5,
    code: 'ZRY/DN/2026/0005',
    date: '20 May 2026',
    donor: 'Sunrise Textiles Pvt Ltd',
    type: 'Gift in kind',
    amount: '₹8.40 L',
    fundMode: 'Restricted',
    location: 'MP · UP',
    compliance: [
      { label: '80G', tone: 'alert' },
      { label: '10BD', tone: 'ok' },
      { label: 'FC', tone: 'no' },
      { label: 'GIK', tone: 'violet' },
    ],
    status: 'Income + asset leg',
    statusTone: 'success',
  },
  {
    id: 6,
    code: 'ZRY/DN/2026/0006',
    date: '02 Jun 2026',
    donor: 'Vikram Nair',
    type: 'Corpus',
    amount: '₹50.00 L',
    fundMode: 'Restricted · corpus',
    location: 'All',
    compliance: [
      { label: '80G', tone: 'ok' },
      { label: '10BD', tone: 'ok' },
      { label: 'FC', tone: 'no' },
      { label: '—', tone: 'no' },
    ],
    status: 'Capital — not income',
    statusTone: 'info',
  },
  {
    id: 7,
    code: 'ZRY/DN/2026/0007',
    date: '15 Jun 2026',
    donor: 'Estate of Late R. K. Menon',
    type: 'Legacy',
    amount: '₹18.00 L expected',
    fundMode: 'Unrestricted',
    location: 'Delhi',
    compliance: [
      { label: '80G', tone: 'no' },
      { label: '10BD', tone: 'no' },
      { label: 'FC', tone: 'no' },
      { label: 'PRB', tone: 'wait' },
    ],
    status: 'In probate — not income',
    statusTone: 'warning',
  },
];

function FingerprintBadge({ label, tone = 'ok' }) {
  const getColor = () => {
    switch (tone) {
      case 'ok':
        return '#5fd68f';
      case 'alert':
        return '#f2716f';
      case 'fcra':
        return '#6cc5e8';
      case 'violet':
        return '#b39ae0';
      case 'wait':
        return '#f5b83d';
      default:
        return 'var(--text3)';
    }
  };

  const textColor = getColor();

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 26,
        height: 18,
        px: 0.5,
        borderRadius: '4px',
        fontSize: 9.5,
        fontWeight: 700,
        bgcolor: 'transparent',
        color: textColor,
        border: '1px solid',
        borderColor: tone === 'no' ? 'var(--border)' : textColor,
        opacity: tone === 'no' ? 0.4 : 1,
        mr: 0.5,
      }}
    >
      {label}
    </Box>
  );
}

const columns = [
  { key: 'code', header: 'CODE', width: 160, render: (r) => <span style={{ whiteSpace: 'nowrap' }}>{r.code}</span> },
  { key: 'date', header: 'DATE', width: 110 },
  { key: 'donor', header: 'DONOR', render: (r) => <b>{r.donor}</b> },
  { key: 'type', header: 'TYPE' },
  {
    key: 'amount',
    header: 'AMOUNT',
    render: (r) => (
      <Box>
        <b>{r.amount}</b>
        {r.subAmount && (
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: 10 }}>
            {r.subAmount}
          </Typography>
        )}
      </Box>
    ),
  },
  {
    key: 'fundMode',
    header: 'FUND MODE',
    render: (r) => {
      const isRestricted = r.fundMode.includes('Restricted');
      const chipColor = isRestricted ? '#f5b83d' : '#5fd68f';
      return (
        <Chip
          label={r.fundMode}
          size="small"
          sx={{
            bgcolor: 'transparent',
            color: chipColor,
            borderColor: chipColor,
            fontSize: 11,
            fontWeight: 600,
          }}
          variant="outlined"
        />
      );
    },
  },
  { key: 'location', header: 'LOCATION' },
  {
    key: 'compliance',
    header: 'COMPLIANCE',
    render: (r) => (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {r.compliance.map((item, idx) => (
          <FingerprintBadge key={idx} label={item.label} tone={item.tone} />
        ))}
      </Box>
    ),
  },
  {
    key: 'status',
    header: 'RECOGNITION',
    render: (r) => (
      <Chip
        label={r.status}
        size="small"
        color={r.statusTone === 'success' ? 'success' : r.statusTone === 'warning' ? 'warning' : 'info'}
        variant="outlined"
        sx={{ fontSize: 11.5 }}
      />
    ),
  },
];

export function DonationsListPage() {
  const [search, setSearch] = useState('');
  const [book, setBook] = useState('LC');
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Donations"
        subtitle="Gifts received across the organisation. A donation is income when it lands — there is no committed stage."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/donations/new')}
          >
            New donation
          </Button>
        }
      />

      {/* Book selector */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: '.13em', textTransform: 'uppercase', fontWeight: 700 }}>
          BOOK
        </Typography>
        <Button
          size="small"
          variant={book === 'LC' ? 'contained' : 'outlined'}
          onClick={() => setBook('LC')}
          sx={{ fontSize: 12, py: 0.25, px: 1.5 }}
        >
          LC · Local
        </Button>
        <Button
          size="small"
          variant={book === 'FC' ? 'contained' : 'outlined'}
          onClick={() => setBook('FC')}
          sx={{ fontSize: 12, py: 0.25, px: 1.5 }}
        >
          FC · Foreign
        </Button>
        <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
          Legally separate books. No combined view is statutory.
        </Typography>
      </Stack>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card sx={{ p: 2 }}>
          <Typography variant="overline" sx={{ fontSize: 10.5, letterSpacing: '.13em', color: 'text.secondary', display: 'block' }}>
            RECEIVED · FY 2026-27
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
            ₹1.19 Cr
          </Typography>
          <Typography variant="caption" color="text.secondary">
            7 donations · excludes pledges & probate
          </Typography>
        </Card>

        <Card sx={{ p: 2 }}>
          <Typography variant="overline" sx={{ fontSize: 10.5, letterSpacing: '.13em', color: 'text.secondary', display: 'block' }}>
            RESTRICTED / UNRESTRICTED
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
            ₹91.4 L <span style={{ fontSize: 15, color: '#888' }}>/ ₹27.5 L</span>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            77% carries a use restriction
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, height: 5, borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'warning.main', flex: 77 }} />
            <Box sx={{ bgcolor: 'success.main', flex: 23 }} />
          </Box>
        </Card>

        <Card sx={{ p: 2 }}>
          <Typography variant="overline" sx={{ fontSize: 10.5, letterSpacing: '.13em', color: 'text.secondary', display: 'block' }}>
            TOP LOCATIONS
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, my: 0.5 }}>
            Delhi · MP · Rajasthan
          </Typography>
          <Typography variant="caption" color="text.secondary">
            State-wise split feeds FCRA disclosure
          </Typography>
        </Card>

        <Card sx={{ p: 2, borderColor: 'warning.main' }}>
          <Typography variant="overline" sx={{ fontSize: 10.5, letterSpacing: '.13em', color: 'warning.main', display: 'block' }}>
            COMPLIANCE QUEUE
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5, color: 'warning.main' }}>
            4
          </Typography>
          <Typography variant="caption" color="text.secondary">
            2 awaiting 80G · 1 missing ID for 10BD · 1 anonymous near 115BBC limit · 1 GIK liquidation due
          </Typography>
        </Card>
      </Box>

      {/* Filter Bar */}
      <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 2, alignItems: 'center' }}>
        <Box sx={{ flex: '1 1 240px' }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search donations, donors, receipt numbers…" />
        </Box>
        <Select size="small" defaultValue="FY 2026-27" sx={{ minWidth: 130 }}>
          <MenuItem value="FY 2026-27">FY 2026-27</MenuItem>
          <MenuItem value="FY 2025-26">FY 2025-26</MenuItem>
        </Select>
        <Select size="small" defaultValue="All types" sx={{ minWidth: 130 }}>
          <MenuItem value="All types">All types</MenuItem>
          <MenuItem value="Major gift">Major gift</MenuItem>
          <MenuItem value="Recurring">Recurring</MenuItem>
          <MenuItem value="One-time">One-time</MenuItem>
        </Select>
        <Select size="small" defaultValue="All modes" sx={{ minWidth: 130 }}>
          <MenuItem value="All modes">All modes</MenuItem>
          <MenuItem value="Restricted">Restricted</MenuItem>
          <MenuItem value="Unrestricted">Unrestricted</MenuItem>
        </Select>
        <Select size="small" defaultValue="All sources" sx={{ minWidth: 130 }}>
          <MenuItem value="All sources">All sources</MenuItem>
          <MenuItem value="Domestic">Domestic</MenuItem>
          <MenuItem value="FCRA / foreign">FCRA / foreign</MenuItem>
        </Select>
        <Select size="small" defaultValue="All compliance states" sx={{ minWidth: 160 }}>
          <MenuItem value="All compliance states">All compliance states</MenuItem>
          <MenuItem value="80G pending">80G pending</MenuItem>
          <MenuItem value="10BD incomplete">10BD incomplete</MenuItem>
          <MenuItem value="Anonymous">Anonymous</MenuItem>
        </Select>
      </Stack>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={MOCK_DONATIONS}
        getRowKey={(row) => row.id}
      />

      {/* Compliance Fingerprint Key */}
      <Box sx={{ mt: 1.5, mb: 1, fontSize: 11.5, color: 'text.secondary' }}>
        <b>Compliance fingerprint</b> — same four slots on every row, read left to right: 80G receipt · 10BD reportability · FC = FCRA / foreign.
        <br />
        Special: 115 = anonymous, GIK = gift in kind, PRB = probate pending, LIQ = liquidation due
      </Box>
    </>
  );
}
