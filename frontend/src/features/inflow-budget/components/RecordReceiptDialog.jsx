import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { AS_AT_DATE } from '../constants.js';

const emptyForm = { actualDate: '', actualAmount: '', actualFx: '', bankRef: '', voucherNo: '', varianceReason: '' };

function initialFormFor(row) {
  if (!row) return emptyForm;
  return {
    actualDate: AS_AT_DATE,
    actualAmount: String(row.expectedAmount),
    actualFx: row.book === 'FC' ? String(row.expectedFx || '') : '',
    bankRef: '',
    voucherNo: '',
    varianceReason: '',
  };
}

/** Stage 2 of the design: the only place the user types. Pre-fills from what
 * the donor module already scheduled; only asks for what it doesn't carry.
 * Callers should key this component by row.id so a new row remounts it with
 * fresh initial state instead of reusing a stale form. */
export function RecordReceiptDialog({ row, onClose, onSave }) {
  const [form, setForm] = useState(() => initialFormFor(row));

  const hasVariance = row && form.actualAmount !== '' && Number(form.actualAmount) !== row.expectedAmount;

  const canSave =
    form.actualDate &&
    form.actualAmount &&
    Number(form.actualAmount) > 0 &&
    form.bankRef.trim() &&
    (!hasVariance || form.varianceReason.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!row || !canSave) return;
    onSave({
      actualDate: form.actualDate,
      actualAmount: Number(form.actualAmount),
      actualFx: form.actualFx ? Number(form.actualFx) : row.actualFx,
      bankRef: form.bankRef.trim(),
      voucherNo: form.voucherNo.trim(),
      varianceReason: form.varianceReason.trim(),
    });
  };

  return (
    <Dialog open={Boolean(row)} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 0.5 }}>Record Receipt</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {row?.id} · {row?.donor} · Expected {row ? formatInrExact(row.expectedAmount) : ''} on{' '}
            {row ? formatDate(row.expectedDate) : ''}
          </Typography>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              type="date"
              label="Actual date *"
              InputLabelProps={{ shrink: true }}
              value={form.actualDate}
              onChange={(e) => setForm((f) => ({ ...f, actualDate: e.target.value }))}
            />
            <TextField
              fullWidth
              type="number"
              label="Actual amount (₹) *"
              value={form.actualAmount}
              onChange={(e) => setForm((f) => ({ ...f, actualAmount: e.target.value }))}
            />
            {row?.book === 'FC' ? (
              <TextField
                fullWidth
                type="number"
                label="Actual FX rate"
                value={form.actualFx}
                onChange={(e) => setForm((f) => ({ ...f, actualFx: e.target.value }))}
              />
            ) : null}
            <TextField
              fullWidth
              label="Bank reference / UTR *"
              value={form.bankRef}
              onChange={(e) => setForm((f) => ({ ...f, bankRef: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Receipt voucher no."
              value={form.voucherNo}
              onChange={(e) => setForm((f) => ({ ...f, voucherNo: e.target.value }))}
            />
            {hasVariance ? (
              <TextField
                fullWidth
                label="Variance reason *"
                placeholder="Why does the actual amount differ from what was expected?"
                value={form.varianceReason}
                onChange={(e) => setForm((f) => ({ ...f, varianceReason: e.target.value }))}
                multiline
                minRows={2}
              />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={!canSave}>
            Save Receipt
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
