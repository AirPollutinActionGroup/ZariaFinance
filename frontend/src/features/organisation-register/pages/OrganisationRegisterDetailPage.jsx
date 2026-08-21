import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  ConfirmDialog,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusChip,
} from '../../../shared/components/index.js';
import { formatDateTime } from '../../../lib/format/date.js';
import { useOrganisation, useOrganisationLifecycle } from '../hooks/useOrganisations.js';
import { ORGANISATION_STATUS_TONE } from '../constants.js';

function DetailField({ label, value, isLink = false }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Typography variant="caption" component="p" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
        {label}
      </Typography>
      {isLink && value ? (
        <Link href={value} target="_blank" rel="noopener noreferrer" underline="hover" sx={{ fontWeight: 600 }}>
          {value}
        </Link>
      ) : (
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || '—'}
        </Typography>
      )}
    </Grid>
  );
}

export function OrganisationRegisterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const organisationQuery = useOrganisation(id);
  const lifecycle = useOrganisationLifecycle(id);
  const [pendingAction, setPendingAction] = useState(null);

  if (organisationQuery.isPending) return <LoadingState label="Loading organisation…" />;
  if (organisationQuery.isError) {
    return <ErrorState error={organisationQuery.error} onRetry={organisationQuery.refetch} />;
  }

  const org = organisationQuery.data;

  const runLifecycle = async () => {
    await lifecycle.mutateAsync(pendingAction);
    setPendingAction(null);
  };

  return (
    <Box>
      <PageHeader
        title={org.name}
        subtitle={`${org.shortName} · ${org.cityName}, ${org.stateName}`}
        actions={
          <Stack direction="row" spacing={1.5}>
            {org.status === 'ACTIVE' ? (
              <Button color="inherit" onClick={() => setPendingAction('deactivate')}>
                Deactivate
              </Button>
            ) : (
              <Button color="inherit" onClick={() => setPendingAction('activate')}>
                Activate
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/organisation-register')}
            >
              Back to List
            </Button>
          </Stack>
        }
      />

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* SECTION 1: ORGANISATION INFORMATION */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
            <BusinessIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Organisation Details
            </Typography>
          </Stack>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <DetailField label="ORGANISATION NAME" value={org.name} />
            <DetailField label="ORGANISATION SHORT NAME" value={org.shortName} />
            <DetailField label="EMAIL" value={org.email} />
            <DetailField label="PHONE NO" value={org.phone} />
            <DetailField label="WEB URL" value={org.webUrl} isLink />
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="caption" component="p" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                STATUS
              </Typography>
              <StatusChip
                label={org.statusLabel}
                tone={ORGANISATION_STATUS_TONE[org.status] || 'neutral'}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* SECTION 2: ADDRESS & LOCATION DETAILS */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2.5 }}>
            <LocationOnIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Address & Location Details
            </Typography>
          </Stack>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <DetailField label="ADDRESS 1" value={org.address1} />
            <DetailField label="ADDRESS 2" value={org.address2} />
            <DetailField label="CITY" value={org.cityName} />
            <DetailField label="STATE" value={org.stateName} />
            <DetailField label="ZIP CODE" value={org.zipCode} />
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <DetailField label="REGISTERED ON" value={formatDateTime(org.createdAt)} />
            <DetailField label="LAST UPDATED" value={formatDateTime(org.updatedAt)} />
          </Grid>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction === 'activate' ? 'Activate organisation' : 'Deactivate organisation'}
        description={
          pendingAction === 'activate'
            ? `Activate ${org.name}? It becomes available across the platform.`
            : `Deactivate ${org.name}? It will be excluded from new activity until reactivated.`
        }
        confirmLabel={pendingAction === 'activate' ? 'Activate' : 'Deactivate'}
        confirmColor={pendingAction === 'activate' ? 'primary' : 'error'}
        busy={lifecycle.isPending}
        onConfirm={runLifecycle}
        onClose={() => setPendingAction(null)}
      />
    </Box>
  );
}
