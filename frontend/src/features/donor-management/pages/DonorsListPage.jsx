import { useState } from 'react';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { formatInr, formatInrExact } from '../../../lib/format/currency.js';
import { useDonors } from '../hooks/useDonors.js';
import {
  DONOR_STATUS_TONE,
  FUND_CLASS_CODE_LABEL,
  FUND_CLASS_CODE_TONE,
  MODULE_ID,
} from '../constants.js';

/** Header for the Fund Class column with an info icon explaining classes A/B/C. */
function FundClassHeader() {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      Fund class
      <Tooltip
        title={
          <Box sx={{ py: 0.5, maxWidth: 320 }}>
            {Object.values(FUND_CLASS_CODE_LABEL).map((text) => (
              <Typography
                key={text}
                variant="caption"
                component="p"
                sx={{ mb: 1, '&:last-child': { mb: 0 } }}
              >
                {text}
              </Typography>
            ))}
          </Box>
        }
      >
        <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
      </Tooltip>
    </Box>
  );
}

const columns = [
  { key: 'donorCode', header: 'Code', width: 110 },
  { key: 'donorName', header: 'Donor' },
  { key: 'donorType', header: 'Type' },
  {
    key: 'fundClass',
    header: <FundClassHeader />,
    render: (row) => {
      const codes = row.fundClassCodes || [];
      if (!codes.length) return '—';
      return (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {codes.map((code) => (
            <Tooltip key={code} title={FUND_CLASS_CODE_LABEL[code] || ''}>
              <Box component="span">
                <StatusChip label={code} tone={FUND_CLASS_CODE_TONE[code] || 'neutral'} />
              </Box>
            </Tooltip>
          ))}
        </Box>
      );
    },
  },
  {
    key: 'fundSourceDomicile',
    header: 'Fund source',
    render: (row) =>
      row.fundSourceDomicile ? (
        <StatusChip
          label={row.fundSourceDomicile}
          tone={row.fundSourceDomicile === 'Foreign' ? 'graphite' : 'neutral'}
        />
      ) : (
        '—'
      ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusChip label={row.statusLabel} tone={DONOR_STATUS_TONE[row.status] || 'neutral'} />,
  },
  {
    key: 'totalCommitted',
    header: 'Total committed',
    align: 'right',
    render: (row) => {
      const breakdown = row.commitmentBreakdown || [];
      const tip = breakdown.length ? (
        <Box sx={{ py: 0.5 }}>
          {breakdown.map((bucket) => (
            <Typography key={bucket.fundMode} variant="caption" component="p">
              {bucket.fundMode}: {formatInr(bucket.committed)} ({bucket.fundProfileCount} fund
              profile{bucket.fundProfileCount === 1 ? '' : 's'})
            </Typography>
          ))}
          <Typography variant="caption" component="p" sx={{ mt: 0.5, opacity: 0.8 }}>
            Total: {formatInrExact(row.totalCommitted)}
          </Typography>
        </Box>
      ) : (
        ''
      );
      return (
        <Tooltip title={tip}>
          <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
            {formatInr(row.totalCommitted)}
          </Box>
        </Tooltip>
      );
    },
  },
];

/** Donor register — /donors. */
export function DonorsListPage() {
  const [search, setSearch] = useState('');
  const donorsQuery = useDonors(search);
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Donor Register"
        subtitle="Funding sources across the organisation"
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/donors/new')}
            >
              New donor
            </Button>
          </PermissionGate>
        }
      />
      <Box sx={{ mb: 2, maxWidth: 420 }}>
        <SearchField value={search} onChange={setSearch} placeholder="Search donors…" />
      </Box>
      <DataTable
        columns={columns}
        rows={donorsQuery.data || []}
        getRowKey={(row) => row.id}
        isLoading={donorsQuery.isPending}
        error={donorsQuery.isError ? donorsQuery.error : null}
        onRetry={donorsQuery.refetch}
        emptyTitle="No donors registered"
        emptyDescription="Create the first donor record to start mapping funding sources."
        onRowClick={(row) => navigate(`/donors/${row.id}`)}
      />
    </>
  );
}
