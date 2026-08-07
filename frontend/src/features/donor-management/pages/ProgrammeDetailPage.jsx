import { useState } from 'react';
import { Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import {
  ConfirmDialog,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusChip,
} from '../../../shared/components/index.js';
import { formatDateTime } from '../../../lib/format/date.js';
import { useProgramme, useProgrammeLifecycle } from '../hooks/useProgrammes.js';
import { MODULE_ID } from '../constants.js';

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
  const lifecycle = useProgrammeLifecycle(id);
  const [pendingAction, setPendingAction] = useState(null);

  if (programmeQuery.isPending) return <LoadingState label="Loading programme…" />;
  if (programmeQuery.isError) {
    return <ErrorState error={programmeQuery.error} onRetry={programmeQuery.refetch} />;
  }

  const programme = programmeQuery.data;

  const runLifecycle = async () => {
    await lifecycle.mutateAsync(pendingAction);
    setPendingAction(null);
  };

  return (
    <>
      <PageHeader
        title={programme.programmeName}
        subtitle={`Programme ${programme.programmeCode}`}
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            {programme.isActive ? (
              <Button color="inherit" onClick={() => setPendingAction('deactivate')}>
                Deactivate
              </Button>
            ) : (
              <Button color="inherit" onClick={() => setPendingAction('activate')}>
                Activate
              </Button>
            )}
          </PermissionGate>
        }
      />

      <Stack spacing={3}>
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
              <StatusChip
                label={programme.isActive ? 'Active' : 'Inactive'}
                tone={programme.isActive ? 'success' : 'neutral'}
              />
            </Stack>
            <Grid container spacing={2.5}>
              <Field label="Programme code" value={programme.programmeCode} />
              <Field label="Programme name" value={programme.programmeName} />
              <Field label="Created" value={formatDateTime(programme.createdAt)} />
              <Grid size={12}>
                <Typography variant="caption" component="p">
                  Description
                </Typography>
                <Typography variant="body1">{programme.description || '—'}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Stack>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction === 'activate' ? 'Activate programme' : 'Deactivate programme'}
        description={
          pendingAction === 'activate'
            ? `Reactivate ${programme.programmeName}? It becomes available for new donations and grants again.`
            : `Deactivate ${programme.programmeName}? Existing donations and grants remain tied to it, but it is excluded from new selections.`
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
