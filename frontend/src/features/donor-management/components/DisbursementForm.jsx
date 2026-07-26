import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { disbursementSchema } from '../validation/disbursementSchema.js';
import { TrancheCard } from './TrancheCard.jsx';
import {
  DISBURSEMENT_TYPES,
  SCHEDULE_TYPES,
  emptyTranche,
  toDisbursementFormValues,
} from '../mappers/disbursementMapper.js';

/**
 * Disbursement Rules for one grant: the schedule (§1), its tranches (§3), their
 * release criteria (§4) and reminders (§5).
 *
 * The committed total is read-only — it is the grant's total grant amount, and
 * the plan can only be finalised once the tranches add up to it (§ Functional
 * Behaviour). Lump Sum collapses to a single release on one date.
 */
export function DisbursementForm({
  schedule,
  onSubmit,
  onFinalise,
  onPrefill,
  saving,
  finalising,
  prefilling,
  saveError,
  finaliseError,
  canPrefill,
}) {
  const { control, handleSubmit, setError, reset } = useForm({
    resolver: zodResolver(disbursementSchema),
    defaultValues: toDisbursementFormValues(schedule),
  });

  const tranches = useFieldArray({ control, name: 'tranches' });
  const disbursementType = useWatch({ control, name: 'disbursementType' });
  const scheduleType = useWatch({ control, name: 'scheduleType' });
  const trancheValues = useWatch({ control, name: 'tranches' });
  const lumpSum = disbursementType === 'LUMP_SUM';

  // Expansion is tracked by react-hook-form's own field id, not by index, so a
  // reset collapses everything for free: the new fields carry new ids that are not
  // in this set. A tranche with no server id has never been saved, so it opens.
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  // Re-seed when the server returns a new configuration (save, finalise, prefill).
  useEffect(() => {
    if (schedule) {
      reset(toDisbursementFormValues(schedule));
    }
  }, [schedule, reset]);

  const committed = Number(schedule?.totalAmountCommitted ?? 0);
  const allocated = (trancheValues || []).reduce((sum, t) => {
    const amount = Number(t?.amount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);
  const remaining = committed - allocated;
  const balanced = committed > 0 && Math.abs(remaining) < 0.005;

  const frequencyLabel = lumpSum
    ? null
    : SCHEDULE_TYPES.find((s) => s.value === scheduleType)?.label || null;

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  // A new tranche has no server id, so it renders expanded without extra state.
  const addTranche = () => tranches.append(emptyTranche());

  const toggleExpanded = (fieldId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Stack spacing={3}>
        {saveError && !saveError.fieldErrors ? (
          <Alert severity="error">{saveError.message}</Alert>
        ) : null}
        {finaliseError ? (
          <Alert severity="warning">
            {finaliseError.message}
            {finaliseError.fieldErrors?.tranches ? ` — ${finaliseError.fieldErrors.tranches}` : ''}
          </Alert>
        ) : null}

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h2">Disbursement schedule</Typography>
              {schedule?.finalised ? <Chip color="success" label="Finalised" /> : null}
            </Stack>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                {/* Read-only: the committed total is the grant's total grant amount,
                    which the tranche plan must match. */}
                <TextField
                  label="Total amount committed"
                  value={formatInrExact(committed)}
                  disabled
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  helperText="From the grant's total grant amount"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect
                  name="disbursementType"
                  control={control}
                  label="Disbursement type"
                  required
                  options={DISBURSEMENT_TYPES}
                />
              </Grid>

              {lumpSum ? (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfTextField
                    name="receivingDate"
                    control={control}
                    label="Receiving date"
                    required
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
              ) : (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfSelect
                    name="scheduleType"
                    control={control}
                    label="Schedule type"
                    required
                    options={SCHEDULE_TYPES}
                    helperText="Each tranche shows this as its frequency"
                  />
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>

        <Box>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}
          >
            <Typography variant="h4" component="h2">
              {lumpSum ? 'Release' : 'Tranches'}
            </Typography>
            {!lumpSum ? (
              <Stack direction="row" spacing={1}>
                {canPrefill ? (
                  <Button size="small" onClick={onPrefill} disabled={prefilling}>
                    {prefilling ? 'Copying…' : 'Copy from fund profile plan'}
                  </Button>
                ) : null}
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addTranche}>
                  Add tranche
                </Button>
              </Stack>
            ) : null}
          </Stack>

          {lumpSum ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              A lump sum is recorded as a single release of the full committed amount on the receiving
              date. Save to create it, then add its release criteria.
            </Alert>
          ) : null}

          <Stack spacing={2}>
            {tranches.fields.map((field, index) => (
              <TrancheCard
                key={field.id}
                control={control}
                index={index}
                path={`tranches.${index}`}
                expanded={expandedIds.has(field.id) || trancheValues?.[index]?.id == null}
                onToggleExpanded={() => toggleExpanded(field.id)}
                onRemove={() => tranches.remove(index)}
                frequencyLabel={frequencyLabel}
                lumpSum={lumpSum}
                isFinal={index === tranches.fields.length - 1}
              />
            ))}
          </Stack>

          {!lumpSum && tranches.fields.length === 0 ? (
            <Alert severity="info">
              No tranches yet. Add them one at a time until they add up to the committed amount.
            </Alert>
          ) : null}
        </Box>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Committed</Typography>
                <Typography variant="h6">{formatInrExact(committed)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">Allocated to tranches</Typography>
                <Typography variant="h6">{formatInrExact(allocated)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  {remaining < 0 ? 'Over-allocated by' : 'Still to allocate'}
                </Typography>
                <Typography variant="h6" color={balanced ? 'success.main' : 'error.main'}>
                  {formatInrExact(Math.abs(remaining))}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1 }}>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? 'Saving…' : 'Save schedule'}
              </Button>
              <Button
                variant="outlined"
                onClick={onFinalise}
                disabled={finalising || !balanced || saving}
                title={balanced ? undefined : 'Tranche amounts must equal the committed amount'}
              >
                {finalising ? 'Finalising…' : 'Finalise'}
              </Button>
            </Stack>
            {!balanced ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'right' }}>
                Finalising needs the tranche amounts to equal the committed amount exactly.
              </Typography>
            ) : null}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
