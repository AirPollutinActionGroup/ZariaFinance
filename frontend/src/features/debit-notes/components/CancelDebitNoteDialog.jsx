import { useState } from 'react';
import { TextField } from '@mui/material';
import { ConfirmDialog } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';

/** Confirms cancelling an issued note. Key it by note id so the reason field resets per note. */
export function CancelDebitNoteDialog({ note, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  return (
    <ConfirmDialog
      open={Boolean(note)}
      title={`Cancel ${note?.id ?? ''}?`}
      description={
        note
          ? `${formatInrExact(note.amount)} will be removed from Spent on ${note.outflowLineId}. The note stays on record as Cancelled.`
          : ''
      }
      confirmLabel="Cancel debit note"
      confirmColor="error"
      onClose={onClose}
      onConfirm={() => onConfirm(reason.trim())}
    >
      <TextField fullWidth multiline minRows={2} sx={{ mt: 2 }} label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
    </ConfirmDialog>
  );
}
