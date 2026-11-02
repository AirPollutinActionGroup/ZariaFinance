import { useState } from 'react';
import { Alert, Box, Button, Grid, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../../../core/auth/index.js';
import { ConfirmDialog, ErrorState, LoadingState } from '../../../shared/components/index.js';
import { formatDateTime } from '../../../lib/format/date.js';
import {
  useFundSuggestionWeights,
  useResetFundSuggestionWeights,
  useUpdateFundSuggestionWeights,
} from '../../debit-notes/hooks/useFundSuggestionWeights.js';
import { WEIGHT_FIELDS, maxScore, validateWeights } from '../../debit-notes/lib/fundSuggestionWeights.js';

/**
 * Master Configuration → Fund Suggestion. The points a fund earns towards its
 * score when the debit note form suggests funds. Changes apply to the next
 * suggestion straight away; every change needs a reason.
 */
export function FundSuggestionWeightsTab() {
  const query = useFundSuggestionWeights();
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (query.isPending) return <LoadingState label="Loading weights…" />;
  // Re-mount the form whenever the saved weights change, so it starts from them.
  return <WeightsForm key={String(query.data.updatedAt)} saved={query.data} />;
}

function WeightsForm({ saved }) {
  const { user } = useAuth();
  const update = useUpdateFundSuggestionWeights();
  const reset = useResetFundSuggestionWeights();
  const [values, setValues] = useState({ ...saved.weights, reason: '' });
  const [submitted, setSubmitted] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState(null);

  const errors = validateWeights(values);
  const isValid = Object.keys(errors).length === 0;
  const changed = WEIGHT_FIELDS.some(({ key }) => Number(values[key]) !== saved.weights[key]);
  const atDefaults = WEIGHT_FIELDS.every(({ key }) => saved.weights[key] === saved.defaults[key]);
  const show = (key) => (submitted ? errors[key] : key === 'reason' ? null : errors[key]);
  const actor = user?.name || 'You';

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const handleSave = async () => {
    setSubmitted(true);
    setNotice(null);
    if (!isValid) return;
    const payload = { reason: values.reason.trim(), actor };
    WEIGHT_FIELDS.forEach(({ key }) => {
      payload[key] = Number(values[key]);
    });
    try {
      await update.mutateAsync(payload);
      setNotice('Weights saved — new suggestions use them straight away.');
    } catch {
      // shown from update.error
    }
  };

  const handleReset = async () => {
    try {
      await reset.mutateAsync(actor);
      setConfirmReset(false);
      setNotice('Weights reset to the defaults.');
    } catch {
      setConfirmReset(false);
    }
  };

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Fund suggestion weights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When a debit note is raised, each eligible fund scores the points below; the highest score is suggested first.
            </Typography>
          </Box>
          <Box sx={{ textAlign: { md: 'right' }, flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Highest possible score
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {maxScore(values)}
            </Typography>
          </Box>
        </Stack>

        {notice ? <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice(null)}>{notice}</Alert> : null}
        {update.error ? <Alert severity="error" sx={{ mb: 2 }}>{update.error.message || 'Could not save the weights.'}</Alert> : null}
        {reset.error ? <Alert severity="error" sx={{ mb: 2 }}>{reset.error.message || 'Could not reset the weights.'}</Alert> : null}

        <Grid container spacing={2}>
          {WEIGHT_FIELDS.map(({ key, label, min, max, unit }) => {
            const isDefault = Number(values[key]) === saved.defaults[key];
            return (
              <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label={label}
                  value={values[key]}
                  onChange={set(key)}
                  error={Boolean(show(key))}
                  helperText={show(key) || `Default ${saved.defaults[key]}${isDefault ? '' : ' · changed'}`}
                  slotProps={{
                    htmlInput: { min, max, step: 1 },
                    input: { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> },
                    formHelperText: { sx: { color: !show(key) && !isDefault ? 'warning.main' : undefined } },
                  }}
                />
              </Grid>
            );
          })}
          <Grid size={12}>
            <TextField
              fullWidth
              required
              label="Reason for the change"
              placeholder="e.g. Use grants ending this quarter first"
              value={values.reason}
              onChange={set('reason')}
              error={Boolean(show('reason'))}
              helperText={show('reason') || 'Kept with the weights so finance can see why they changed.'}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          </Grid>
        </Grid>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ mt: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>
            {saved.updatedAt
              ? `Last changed by ${saved.updatedBy || '—'} on ${formatDateTime(saved.updatedAt)}${saved.changeReason ? ` — “${saved.changeReason}”` : ''}`
              : 'Using the shipped defaults.'}
          </Typography>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RestartAltIcon />}
            onClick={() => setConfirmReset(true)}
            disabled={atDefaults || reset.isPending}
          >
            Reset to defaults
          </Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={!changed || update.isPending}>
            {update.isPending ? 'Saving…' : 'Save weights'}
          </Button>
        </Stack>
      </Paper>

      <ConfirmDialog
        open={confirmReset}
        title="Reset to defaults?"
        description="Every weight goes back to the shipped default. New suggestions use them straight away."
        confirmLabel="Reset"
        onConfirm={handleReset}
        onClose={() => setConfirmReset(false)}
        busy={reset.isPending}
      />
    </Box>
  );
}
