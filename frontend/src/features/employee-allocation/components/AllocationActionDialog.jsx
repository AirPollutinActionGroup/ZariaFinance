import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useEndEmployeeAllocation, useRemoveEmployeeAllocation } from '../hooks/useEmployeeAllocations.js';
import { isActiveAllocation } from '../services/employeeAllocationService.js';

const today = () => new Date().toISOString().slice(0, 10);

function Choice({ selected, onClick, icon: Icon, title, hint, danger = false, disabled = false }) {
  return (
    <Box
      component="button"
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.25,
        p: 1.5,
        textAlign: 'left',
        font: 'inherit',
        color: 'text.primary',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        borderRadius: 2,
        border: '1.5px solid',
        borderColor: selected ? (danger ? 'error.main' : 'text.primary') : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
      }}
    >
      <Icon fontSize="small" sx={{ mt: 0.25, color: danger ? 'error.main' : 'text.secondary' }} />
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * End or remove one allocation. Ending sets an end date — the allocation stays
 * on record and stops counting after it. Removing deletes it (for mistakes).
 * Both are written to the employee's allocation history.
 */
export function AllocationActionDialog({ allocation, onClose }) {
  const active = allocation ? isActiveAllocation(allocation) : false;
  const [action, setAction] = useState(active ? 'end' : 'remove');
  const [endDate, setEndDate] = useState(today());
  const [note, setNote] = useState('');
  const endMutation = useEndEmployeeAllocation();
  const removeMutation = useRemoveEmployeeAllocation();
  const busy = endMutation.isPending || removeMutation.isPending;
  const error = endMutation.error || removeMutation.error;

  if (!allocation) return null;

  const minEnd = allocation.startDate || undefined;
  const endInvalid = action === 'end' && (!endDate || (minEnd && endDate < minEnd));

  const submit = async () => {
    try {
      if (action === 'end') await endMutation.mutateAsync({ id: allocation.id, endDate, note });
      else await removeMutation.mutateAsync({ id: allocation.id, note });
      onClose();
    } catch {
      // Shown in the dialog.
    }
  };

  return (
    <Dialog open onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Typography component="span" variant="h6" sx={{ fontWeight: 700, display: 'block' }}>
          Change allocation
        </Typography>
        <Typography component="span" variant="body2" color="text.secondary" sx={{ textTransform: 'none', display: 'block' }}>
          {allocation.employeeName} · {allocation.projectName || allocation.programmeName} · {allocation.allocationPct}%
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={1.25} role="radiogroup" sx={{ mt: 1.5 }}>
          <Choice
            selected={action === 'end'}
            onClick={() => setAction('end')}
            icon={EventBusyOutlinedIcon}
            title="End allocation"
            hint={active ? 'The work is over. Kept on record; its % is free from the end date.' : 'Already ended.'}
            disabled={!active}
          />
          <Choice
            selected={action === 'remove'}
            onClick={() => setAction('remove')}
            icon={DeleteOutlineIcon}
            title="Remove allocation"
            hint="It was added by mistake. Deleted, but the removal stays in the history."
            danger
          />
        </Stack>

        <Stack spacing={2} sx={{ mt: 2.5 }}>
          {action === 'end' ? (
            <TextField
              label="End date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
              required
              error={Boolean(endInvalid)}
              helperText={endInvalid ? 'Cannot be before the start date.' : 'From this day its % can be given to other work.'}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: minEnd } }}
            />
          ) : null}
          <TextField
            label="Note (optional)"
            placeholder={action === 'end' ? 'e.g. Moved to another project' : 'e.g. Wrong employee picked'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            size="small"
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: 1000 } }}
          />
          {error ? <Alert severity="error">{error.message || 'Could not save the change.'}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={busy} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color={action === 'remove' ? 'error' : 'primary'}
          onClick={submit}
          disabled={busy || endInvalid}
        >
          {busy ? 'Saving…' : action === 'end' ? 'End allocation' : 'Remove allocation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
