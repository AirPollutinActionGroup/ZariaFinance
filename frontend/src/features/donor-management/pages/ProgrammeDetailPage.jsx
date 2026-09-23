import { useState } from 'react';
import { Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { ConfirmDialog, ErrorState, LoadingState, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { formatDateTime } from '../../../lib/format/date.js';
import { useProgramme, useUpdateProgrammeStatus } from '../hooks/useProgrammes.js';
import { MODULE_ID, PROGRAMME_STATUS_TONE } from '../constants.js';
import { ProgrammeStatusBar } from '../components/ProgrammeStatusBar.jsx';

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

/** Single programme view — /programmes/:id. */
export function ProgrammeDetailPage() {
  const { id } = useParams();
  const programmeQuery = useProgramme(id);
  const updateStatus = useUpdateProgrammeStatus(id);
  const [pendingStatus, setPendingStatus] = useState(null);

  if (programmeQuery.isPending) return <LoadingState label="Loading programme…" />;
  if (programmeQuery.isError) {
    return <ErrorState error={programmeQuery.error} onRetry={programmeQuery.refetch} />;
  }

  const programme = programmeQuery.data;

  const requestStatusChange = (status) => {
    if (status !== programme.status) setPendingStatus(status);
  };

  const confirmStatusChange = async () => {
    await updateStatus.mutateAsync(pendingStatus);
    setPendingStatus(null);
  };

  return (
    <>
      <PageHeader title={programme.programmeName} subtitle={`Programme ${programme.programmeCode}`} />

      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
              <StatusChip label={programme.type || 'Programme'} tone="graphite" />
              <StatusChip
                label={programme.status || (programme.isActive ? 'Active' : 'Inactive')}
                tone={PROGRAMME_STATUS_TONE[programme.status] || (programme.isActive ? 'success' : 'neutral')}
              />
            </Stack>
            <Grid container spacing={2.5}>
              <Field label="Programme code" value={programme.programmeCode} />
              <Field label="Programme name" value={programme.programmeName} />
              {programme.parentProgrammeName ? (
                <Field label="Parent programme" value={programme.parentProgrammeName} />
              ) : null}
              <Field label="Start date" value={programme.startDate} />
              <Field label="End date" value={programme.endDate} />
              <Field label="State" value={programme.stateNames?.join(', ')} />
              <Field label="City" value={programme.cityNames?.join(', ')} />
              <Field label="Created" value={formatDateTime(programme.createdAt)} />
              <Grid size={12}>
                <Typography variant="caption" component="p">
                  Description
                </Typography>
                <Typography variant="body1">{programme.description || '—'}</Typography>
              </Grid>
            </Grid>

            <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
              <Typography variant="caption" component="p" sx={{ mt: 3, mb: 1 }}>
                Status
              </Typography>
              <ProgrammeStatusBar value={programme.status} onChange={requestStatusChange} />
            </PermissionGate>
          </CardContent>
        </Card>
      </Stack>

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title="Change status"
        description={`Change ${programme.programmeName}'s status from "${programme.status}" to "${pendingStatus}"?`}
        confirmLabel="Change status"
        confirmColor="primary"
        busy={updateStatus.isPending}
        onConfirm={confirmStatusChange}
        onClose={() => setPendingStatus(null)}
      />
    </>
  );
}
