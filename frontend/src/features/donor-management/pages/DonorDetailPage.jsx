import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate, useParams } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import {
  ConfirmDialog,
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusChip,
} from '../../../shared/components/index.js';
import { formatDate, formatDateTime } from '../../../lib/format/date.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useDonor, useDonorLifecycle } from '../hooks/useDonors.js';
import { useGrants } from '../hooks/useGrants.js';
import { FundProfilesPanel } from '../components/FundProfilesPanel.jsx';
import {
  DONOR_STATUS_TONE,
  FUND_CLASS_TONE,
  GRANT_STATUS_TONE,
  MODULE_ID,
} from '../constants.js';

function Field({ label, value }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Typography variant="caption" component="p">
        {label}
      </Typography>
      <Typography variant="body1">{value || '—'}</Typography>
    </Grid>
  );
}

const grantColumns = [
  { key: 'grantCode', header: 'Code', width: 110 },
  { key: 'agreementName', header: 'Agreement' },
  { key: 'programmeName', header: 'Programme' },
  { key: 'startDate', header: 'Start', render: (row) => formatDate(row.startDate) },
  { key: 'endDate', header: 'End', render: (row) => formatDate(row.endDate) },
  {
    key: 'totalGrantAmount',
    header: 'Committed',
    align: 'right',
    render: (row) => formatInr(row.totalGrantAmount),
  },
  {
    key: 'grantStatus',
    header: 'Status',
    render: (row) => (
      <StatusChip label={row.statusLabel} tone={GRANT_STATUS_TONE[row.grantStatus] || 'neutral'} />
    ),
  },
];

/** Single donor view — /donors/:id. */
export function DonorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const donorQuery = useDonor(id);
  const grantsQuery = useGrants({ donorId: id });
  const lifecycle = useDonorLifecycle(id);
  const [pendingAction, setPendingAction] = useState(null);

  if (donorQuery.isPending) return <LoadingState label="Loading donor…" />;
  if (donorQuery.isError) return <ErrorState error={donorQuery.error} onRetry={donorQuery.refetch} />;

  const donor = donorQuery.data;

  const runLifecycle = async () => {
    await lifecycle.mutateAsync(pendingAction);
    setPendingAction(null);
  };

  return (
    <>
      <PageHeader
        title={donor.donorName}
        subtitle={`Donor ${donor.donorCode}`}
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Stack direction="row" spacing={1.5}>
              {donor.isActive ? (
                <Button color="inherit" onClick={() => setPendingAction('deactivate')}>
                  Deactivate
                </Button>
              ) : (
                <Button color="inherit" onClick={() => setPendingAction('activate')}>
                  Activate
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/donors/${donor.id}/edit`)}
              >
                Edit
              </Button>
            </Stack>
          </PermissionGate>
        }
      />

      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
              <StatusChip
                label={donor.statusLabel}
                tone={DONOR_STATUS_TONE[donor.status] || 'neutral'}
              />
              <StatusChip
                label={donor.fundClassLabel}
                tone={FUND_CLASS_TONE[donor.fundClass] || 'neutral'}
              />
            </Stack>
            <Grid container spacing={2.5}>
              <Field label="Donor type" value={donor.donorType} />
              <Field label="Email" value={donor.email} />
              <Field label="Phone" value={donor.phoneNumber} />
              <Field label="Website" value={donor.website} />
              <Field label="Registration no." value={donor.registrationNumber} />
              <Field label="Tax ID" value={donor.taxId} />
              <Field label="Address" value={donor.address} />
              <Field label="City" value={donor.cityName} />
              <Field label="State" value={donor.stateName} />
              <Field label="Country" value={donor.country} />
              <Field label="Postal code" value={donor.postalCode} />
              <Field label="Created" value={formatDateTime(donor.createdAt)} />
              <Field label="Last updated" value={formatDateTime(donor.updatedAt)} />
            </Grid>
          </CardContent>
        </Card>

        <FundProfilesPanel donorId={donor.id} />

        <DataTable
          title="Grant agreements"
          columns={grantColumns}
          rows={grantsQuery.data || []}
          getRowKey={(row) => row.id}
          isLoading={grantsQuery.isPending}
          error={grantsQuery.isError ? grantsQuery.error : null}
          onRetry={grantsQuery.refetch}
          emptyTitle="No grants for this donor"
          onRowClick={(row) => navigate(`/grants/${row.id}`)}
        />
      </Stack>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction === 'activate' ? 'Activate donor' : 'Deactivate donor'}
        description={
          pendingAction === 'activate'
            ? `Reactivate ${donor.donorName}? The donor becomes available for new mappings.`
            : `Deactivate ${donor.donorName}? Existing grants remain, but the donor is excluded from new activity.`
        }
        confirmLabel={pendingAction === 'activate' ? 'Activate' : 'Deactivate'}
        confirmColor={pendingAction === 'activate' ? 'primary' : 'error'}
        busy={lifecycle.isPending}
        onConfirm={runLifecycle}
        onClose={() => setPendingAction(null)}
      />
    </>
  );
}
