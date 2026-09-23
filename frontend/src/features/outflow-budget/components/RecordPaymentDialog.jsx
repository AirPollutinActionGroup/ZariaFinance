import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { AS_AT_DATE } from '../constants.js';

const emptyForm = { actualDate: '', actualAmount: '', actualFx: '', paymentRef: '', voucherNo: '', varianceReason: '' };

function initialFormFor(row) {
  if (!row) return emptyForm;
  return {
    actualDate: AS_AT_DATE,
    actualAmount: String(row.expectedAmount),
    actualFx: row.book === 'FC' ? String(row.expectedFx || '') : '',
    paymentRef: '',
    voucherNo: '',
    varianceReason: '',
  };
}

/** The only place the user types when money goes out. Pre-fills from what the
 * approved budget line already scheduled; only asks for what it doesn't
 * carry. Callers should key this component by row.id so a new row remounts
 * it with fresh initial state instead of reusing a stale form. */
export function RecordPaymentDialog({ row, onClose, onSave }) {
  const [form, setForm] = useState(() => initialFormFor(row));

  const hasVariance = row && form.actualAmount !== '' && Number(form.actualAmount) !== row.expectedAmount;

  const canSave =
    form.actualDate &&
    form.actualAmount &&
    Number(form.actualAmount) > 0 &&
    form.paymentRef.trim() &&
    (!hasVariance || form.varianceReason.trim());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!row || !canSave) return;
    onSave({
      actualDate: form.actualDate,
      actualAmount: Number(form.actualAmount),
      actualFx: form.actualFx ? Number(form.actualFx) : row.actualFx,
      paymentRef: form.paymentRef.trim(),
      voucherNo: form.voucherNo.trim(),
      varianceReason: form.varianceReason.trim(),
    });
  };

  return (
    <Dialog open={Boolean(row)} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 0.5 }}>Record Payment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {row?.id} · {row?.line} · Budgeted {row ? formatInrExact(row.expectedAmount) : ''} on{' '}
            {row ? formatDate(row.expectedDate) : ''}
          </Typography>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              type="date"
              label="Payment date *"
              InputLabelProps={{ shrink: true }}
              value={form.actualDate}
              onChange={(e) => setForm((f) => ({ ...f, actualDate: e.target.value }))}
            />
            <TextField
              fullWidth
              type="number"
              label="Amount paid (₹) *"
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
              label="Payment ref / UTR *"
              value={form.paymentRef}
              onChange={(e) => setForm((f) => ({ ...f, paymentRef: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Payment voucher no."
              value={form.voucherNo}
              onChange={(e) => setForm((f) => ({ ...f, voucherNo: e.target.value }))}
            />
            {hasVariance ? (
              <TextField
                fullWidth
                label="Variance reason *"
                placeholder="Why does the amount paid differ from what was budgeted?"
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
            Save Payment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
