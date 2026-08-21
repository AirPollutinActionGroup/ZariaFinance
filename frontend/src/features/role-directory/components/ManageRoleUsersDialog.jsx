import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useUserRequests } from '../../user-requests/hooks/useUserRequests.js';
import { useAssignedUsers, useAssignUser, useUnassignUser } from '../hooks/useRoles.js';

/** Assign/unassign users for a role, enforcing role.userLimit client-side
 * (the backend is the source of truth and re-validates on submit).
 *
 * Assignable users come from user_register_new (the extended registration
 * flow) rather than the legacy userRegister module's `users` table — only
 * approved requests are offered, since a pending/rejected applicant isn't a
 * real account yet. */
export function ManageRoleUsersDialog({ open, role, onClose }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const assignedUsersQuery = useAssignedUsers(role?.id);
  const usersQuery = useUserRequests();
  const assignUser = useAssignUser(role?.id);
  const unassignUser = useUnassignUser(role?.id);

  const assignedUsers = assignedUsersQuery.data || [];

  // Computed from this dialog's own live query rather than the row snapshot
  // passed in as `role`, which goes stale the moment an assignment changes
  // the count (the parent's row object isn't re-fetched while the dialog is open).
  const limit = Number(role?.userLimit);
  const hasLimit = role?.userLimit !== '' && role?.userLimit != null && !Number.isNaN(limit);
  const assignedCount = assignedUsers.length;
  const userLimitLabel = hasLimit ? `${assignedCount} / ${limit}` : `${assignedCount} / Unlimited`;
  const atLimit = hasLimit && assignedCount >= limit;

  const availableOptions = useMemo(() => {
    const assignedIds = new Set(assignedUsers.map((u) => u.userId));
    return (usersQuery.data || [])
      .filter((u) => u.approvalStatus === 'APPROVED' && !assignedIds.has(u.id))
      .map((u) => ({ id: u.id, label: u.name }));
  }, [usersQuery.data, assignedUsers]);

  const handleAssign = async () => {
    if (!selectedUser) return;
    await assignUser.mutateAsync(selectedUser.id);
    setSelectedUser(null);
  };

  const handleClose = () => {
    setSelectedUser(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Users — {role?.roleName}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {userLimitLabel} users assigned
        </Typography>

        <List dense sx={{ mb: 2 }}>
          {assignedUsers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No users assigned yet.
            </Typography>
          ) : (
            assignedUsers.map((u) => (
              <ListItem
                key={u.userId}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    disabled={unassignUser.isPending}
                    onClick={() => unassignUser.mutate(u.userId)}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText primary={u.userName || `User ${u.userId}`} />
              </ListItem>
            ))
          )}
        </List>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <Autocomplete
            fullWidth
            size="small"
            options={availableOptions}
            value={selectedUser}
            onChange={(_, value) => setSelectedUser(value)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={atLimit}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add user"
                helperText={atLimit ? 'User limit reached for this role.' : ' '}
              />
            )}
          />
          <Button
            variant="contained"
            disabled={!selectedUser || atLimit || assignUser.isPending}
            onClick={handleAssign}
            sx={{ mt: 0.25 }}
          >
            Add
          </Button>
        </Box>
        {assignUser.isError ? (
          <Typography color="error.main" variant="body2" sx={{ mt: 1 }}>
            {assignUser.error?.message || 'Failed to assign user.'}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
