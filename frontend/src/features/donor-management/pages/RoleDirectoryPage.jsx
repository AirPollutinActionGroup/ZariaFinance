import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useRoleDirectory, useSaveRoleDirectory } from '../hooks/useRoleDirectory.js';
import { useUsers, userDisplayName } from '../hooks/useUsers.js';

/**
 * /role-directory — who holds each organisational role, and who deputises.
 *
 * Release-criteria reminders are addressed by role, so an unassigned role means
 * its reminders have nowhere to go; the page says so rather than failing quietly
 * at 01:00. The deputy is notified only — approval authority never transfers.
 */
export function RoleDirectoryPage() {
  const directoryQuery = useRoleDirectory();

  if (directoryQuery.isPending) return <LoadingState label="Loading role directory…" />;
  if (directoryQuery.isError) {
    return <ErrorState error={directoryQuery.error} onRetry={directoryQuery.refetch} />;
  }

  // Keyed on the fetch timestamp so a refetch re-seeds the editable copy by
  // remounting, rather than syncing server data into state from an effect.
  return <RoleDirectoryEditor key={directoryQuery.dataUpdatedAt} entries={directoryQuery.data} />;
}

function RoleDirectoryEditor({ entries }) {
  const usersQuery = useUsers();
  const save = useSaveRoleDirectory();
  const [draft, setDraft] = useState(() => entries.map((entry) => ({ ...entry })));

  const userOptions = usersQuery.data || [];
  const unassigned = draft.filter((entry) => entry.primaryUserId == null);

  const update = (role, field, value) => {
    setDraft((prev) =>
      prev.map((entry) =>
        entry.role === role ? { ...entry, [field]: value === '' ? null : Number(value) } : entry,
      ),
    );
  };

  const submit = () => {
    save.mutate(
      draft.map((entry) => ({
        role: entry.role,
        primaryUserId: entry.primaryUserId,
        deputyUserId: entry.deputyUserId,
      })),
    );
  };

  return (
    <>
      <PageHeader
        title="Role directory"
        subtitle="Who holds each organisational role — used to address disbursement reminders"
      />

      <Stack spacing={2}>
        {save.error ? (
          <Alert severity="error">
            {save.error.message}
            {save.error.fieldErrors?.deputyUserId ? ` — ${save.error.fieldErrors.deputyUserId}` : ''}
          </Alert>
        ) : null}
        {save.isSuccess && !save.error ? <Alert severity="success">Role directory saved.</Alert> : null}
        {unassigned.length > 0 ? (
          <Alert severity="warning">
            {unassigned.map((e) => e.roleLabel).join(', ')} {unassigned.length === 1 ? 'has' : 'have'} no
            holder. Reminders naming {unassigned.length === 1 ? 'that role' : 'those roles'} cannot be
            delivered until someone is assigned.
          </Alert>
        ) : null}

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The deputy receives a copy of each reminder for visibility. Approval authority stays with
              the role holder.
            </Typography>

            <Stack spacing={2}>
              {draft.map((entry) => (
                <Grid container spacing={2} key={entry.role} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="subtitle2">{entry.roleLabel}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label="Holder"
                      value={entry.primaryUserId ?? ''}
                      onChange={(e) => update(entry.role, 'primaryUserId', e.target.value)}
                      disabled={usersQuery.isPending}
                    >
                      <MenuItem value="">— unassigned —</MenuItem>
                      {userOptions.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {userDisplayName(user)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      select
                      fullWidth
                      label="Deputy (notified only)"
                      value={entry.deputyUserId ?? ''}
                      onChange={(e) => update(entry.role, 'deputyUserId', e.target.value)}
                      disabled={usersQuery.isPending}
                    >
                      <MenuItem value="">— none —</MenuItem>
                      {userOptions
                        .filter((user) => user.id !== entry.primaryUserId)
                        .map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {userDisplayName(user)}
                          </MenuItem>
                        ))}
                    </TextField>
                  </Grid>
                </Grid>
              ))}
            </Stack>

            <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={submit}
                disabled={save.isPending}
              >
                {save.isPending ? 'Saving…' : 'Save directory'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
}
