import { useState } from 'react';
import { TextField } from '@mui/material';
import { ConfirmDialog } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';

/** Confirms cancelling an issued credit note. Key it by note id so the reason field resets per note. */
export function CancelCreditNoteDialog({ note, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  return (
    <ConfirmDialog
      open={Boolean(note)}
      title={`Cancel ${note?.id ?? ''}?`}
      description={
        note
          ? `${
              note.outflowLineId
                ? `${formatInrExact(note.amount)} will be added back to Spent on ${note.outflowLineId}${
                    note.debitNoteId ? ` and to what's left to credit on ${note.debitNoteId}` : ''
                  }.`
                : `${formatInrExact(note.amount)} will no longer count${note.fundProfile ? ` towards ${note.fundProfile.name}` : ''}.`
            } The note stays on record as Cancelled.`
          : ''
      }
      confirmLabel="Cancel credit note"
      confirmColor="error"
      onClose={onClose}
      onConfirm={() => onConfirm(reason.trim())}
    >
      <TextField fullWidth multiline minRows={2} sx={{ mt: 2 }} label="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
    </ConfirmDialog>
  );
}
