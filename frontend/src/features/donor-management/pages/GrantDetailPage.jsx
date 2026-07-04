import { useState } from 'react';
import { Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import {
  ConfirmDialog,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusChip,
} from '../../../shared/components/index.js';
import { formatDate, formatDateTime } from '../../../lib/format/date.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { useGrant, useGrantLifecycle } from '../hooks/useGrants.js';
import { grantService } from '../services/grantService.js';
import { FUND_CLASS_TONE, GRANT_STATUS_TONE, MODULE_ID } from '../constants.js';
import { DocumentsPanel } from '../components/DocumentsPanel.jsx';

const ACTION_COPY = {
  approve: {
    label: 'Approve',
    title: 'Approve grant',
    description: 'Approve this grant agreement? Approval is recorded in the audit trail.',
    color: 'primary',
  },
  activate: {
    label: 'Activate',
    title: 'Activate grant',
    description: 'Activate this grant? Committed funds become part of the live position.',
    color: 'primary',
  },
  close: {
    label: 'Close',
    title: 'Close grant',
    description: 'Close this grant agreement? No further transactions can reference it.',
    color: 'error',
  },
};

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

/** Single grant view with lifecycle actions and documents — /grants/:id. */
export function GrantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const grantQuery = useGrant(id);
  const lifecycle = useGrantLifecycle(id);
  const [pendingAction, setPendingAction] = useState(null);

  if (grantQuery.isPending) return <LoadingState label="Loading grant…" />;
  if (grantQuery.isError) return <ErrorState error={grantQuery.error} onRetry={grantQuery.refetch} />;

  const grant = grantQuery.data;
  const actions = grantService.availableActions(grant.grantStatus);

  const runLifecycle = async () => {
    await lifecycle.mutateAsync(pendingAction);
    setPendingAction(null);
  };

  return (
    <>
      <PageHeader
        title={grant.agreementName}
        subtitle={`Grant ${grant.grantCode}`}
        actions={
          <PermissionGate action={ACTIONS.APPROVE} moduleId={MODULE_ID}>
            <Stack direction="row" spacing={1.5}>
              {actions.map((action) => (
                <Button
                  key={action}
                  variant={action === 'close' ? 'outlined' : 'contained'}
                  color={ACTION_COPY[action].color}
                  onClick={() => setPendingAction(action)}
                >
                  {ACTION_COPY[action].label}
                </Button>
              ))}
            </Stack>
          </PermissionGate>
        }
      />

      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
              <StatusChip
                label={grant.statusLabel}
                tone={GRANT_STATUS_TONE[grant.grantStatus] || 'neutral'}
              />
              <StatusChip
                label={grant.fundClassLabel}
                tone={FUND_CLASS_TONE[grant.fundClass] || 'neutral'}
              />
            </Stack>
            <Grid container spacing={2.5}>
              <Field label="Donor" value={grant.donorName} />
              <Field label="Programme" value={grant.programmeName} />
              <Field label="Total grant amount" value={formatInrExact(grant.totalGrantAmount)} />
              <Field label="Agreement date" value={formatDate(grant.agreementDate)} />
              <Field label="Start date" value={formatDate(grant.startDate)} />
              <Field label="End date" value={formatDate(grant.endDate)} />
              <Field label="Description" value={grant.description} />
              <Field label="Agreement document" value={grant.agreementDocumentPath} />
              <Field label="Created" value={formatDateTime(grant.createdAt)} />
              <Field label="Last updated" value={formatDateTime(grant.updatedAt)} />
            </Grid>
            {grant.donorId ? (
              <Button
                size="small"
                sx={{ mt: 2 }}
                onClick={() => navigate(`/donors/${grant.donorId}`)}
              >
                View donor record →
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <DocumentsPanel grantId={Number(id)} />
      </Stack>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction ? ACTION_COPY[pendingAction].title : ''}
        description={pendingAction ? ACTION_COPY[pendingAction].description : ''}
        confirmLabel={pendingAction ? ACTION_COPY[pendingAction].label : ''}
        confirmColor={pendingAction ? ACTION_COPY[pendingAction].color : 'primary'}
        busy={lifecycle.isPending}
        onConfirm={runLifecycle}
        onClose={() => setPendingAction(null)}
      />
    </>
  );
}
