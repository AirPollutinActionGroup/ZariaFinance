import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
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
  DONOR_ACTIVE_TONE,
  FUND_SOURCE_DOMICILE_TONE,
  GRANT_ACTIVE_TONE,
  INDIVIDUAL_ID_TYPE,
  MODULE_ID,
} from '../constants.js';

/**
 * One group of donor details as compact "label  value" rows. Empty values are
 * left out so the card stays short; a group with nothing in it says so.
 */
function DetailGroup({ title, items }) {
  const filled = items.filter(([, value]) => value != null && String(value).trim() !== '');
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="overline"
        component="h3"
        sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.6, mb: 0.75 }}
      >
        {title}
      </Typography>
      {filled.length ? (
        <Box
          component="dl"
          sx={{
            m: 0,
            display: 'grid',
            gridTemplateColumns: 'max-content minmax(0, 1fr)',
            columnGap: 1.5,
            rowGap: 0.75,
            fontSize: 13,
          }}
        >
          {filled.map(([label, value]) => (
            <Box key={label} sx={{ display: 'contents' }}>
              <Box component="dt" sx={{ color: 'text.secondary' }}>
                {label}
              </Box>
              <Box component="dd" sx={{ m: 0, fontWeight: 500, overflowWrap: 'break-word' }}>
                {value}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
          Not added
        </Typography>
      )}
    </Box>
  );
}

/** A clickable email / phone / website value; nothing when blank. */
function linkTo(value, kind) {
  if (!value || !String(value).trim()) return null;
  const href = kind === 'email' ? `mailto:${value}`
    : kind === 'phone' ? `tel:${String(value).replace(/\s+/g, '')}`
      : /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return (
    <Link
      href={href}
      underline="hover"
      color="inherit"
      {...(kind === 'web' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {value}
    </Link>
  );
}

/** Address parts joined into lines, skipping blanks. */
function formatAddress(donor) {
  const cityLine = [donor.cityName, donor.stateName, donor.postalCode].filter(Boolean).join(', ');
  return [donor.address, donor.address2, cityLine].filter(Boolean).join('\n');
}

const grantColumns = [
  { key: 'grantCode', header: 'Code', width: 110, sx: { whiteSpace: 'nowrap' } },
  { key: 'agreementName', header: 'Agreement' },
  { key: 'startDate', header: 'Start', render: (row) => formatDate(row.startDate) },
  { key: 'endDate', header: 'End', render: (row) => formatDate(row.endDate) },
  {
    key: 'totalGrantAmount',
    header: 'Committed',
    align: 'right',
    render: (row) => formatInr(row.totalGrantAmount),
  },
  {
    key: 'isActive',
    header: 'Status',
    render: (row) => (
      <StatusChip label={row.statusLabel} tone={GRANT_ACTIVE_TONE[row.isActive] || 'neutral'} />
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

      <Stack spacing={2}>
        <Card>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              px: 2.5,
              py: 1.25,
              gap: 1,
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
              <StatusChip
                label={donor.isActive ? 'Active' : 'Inactive'}
                tone={DONOR_ACTIVE_TONE[donor.isActive] || 'neutral'}
              />
              <StatusChip
                label={donor.fundSourceDomicileLabel}
                tone={FUND_SOURCE_DOMICILE_TONE[donor.fundSourceDomicile] || 'neutral'}
              />
              {donor.fcraApplicable ? <StatusChip label="FCRA applicable" tone="warning" /> : null}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Created {formatDateTime(donor.createdAt)} · Updated {formatDateTime(donor.updatedAt)}
            </Typography>
          </Stack>
          <CardContent sx={{ px: 2.5, py: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', columnGap: 4, rowGap: 2.5 }}>
              <DetailGroup
                title="Profile"
                items={[
                  ['Donor type', donor.donorTypeLabel],
                  ['Book', donor.fundSourceDomicile === 'FOREIGN' ? 'FC · Foreign contribution' : 'LC · Local contribution'],
                  ...(donor.fundSourceDomicile === 'FOREIGN'
                    ? [['Fund source', donor.foreignFundSourceType]]
                    : []),
                  ['Registration no.', donor.registrationNumber],
                  ...(donor.idType
                    ? [[INDIVIDUAL_ID_TYPE[donor.idType] || 'ID document', donor.idNumber]]
                    : []),
                  ...(donor.fundSourceDomicile === 'FOREIGN' ? [['Passport ID', donor.passportNumber]] : []),
                ]}
              />
              <DetailGroup
                title="Contact"
                items={[
                  ['Email', linkTo(donor.email, 'email')],
                  ['Phone', linkTo(donor.phoneNumber, 'phone')],
                  ['Website', linkTo(donor.website, 'web')],
                ]}
              />
              <DetailGroup
                title="Point of contact"
                items={[
                  ['Name', donor.spocNameOfThePerson],
                  ['Phone', linkTo(donor.spocPhoneNumber, 'phone')],
                  ['Email', linkTo(donor.spocEmail, 'email')],
                ]}
              />
              <DetailGroup
                title="Address"
                items={[
                  ['Address', formatAddress(donor) ? (
                    <Box component="span" sx={{ whiteSpace: 'pre-line' }}>{formatAddress(donor)}</Box>
                  ) : null],
                  ['Country', donor.countryName],
                ]}
              />
            </Box>
          </CardContent>
        </Card>

        <FundProfilesPanel donorId={donor.id} />

        <DataTable
          dense
          title={grantsQuery.data?.length ? `Grant agreements · ${grantsQuery.data.length}` : 'Grant agreements'}
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
