import { Box, Chip, Divider, FormControlLabel, Grid, IconButton, Stack, Switch, Typography } from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Controller, useWatch } from 'react-hook-form';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import {
  CRITERION_TYPES,
  REPEAT_REMINDERS,
  RESPONSIBLE_ROLES,
  TRIGGER_BASES,
  VERIFICATION_ROLES,
  isHumanActioned,
} from '../mappers/disbursementMapper.js';

const CRITERION_OPTIONS = CRITERION_TYPES.map(({ value, label }) => ({ value, label }));

/**
 * One release criterion (Disbursement Rules §4). The type drives which fields
 * appear; the reminder block (§5) is offered only for types a person has to
 * action — Utilisation Threshold is auto-checked and On Signing is instant, so a
 * reminder there would never fire.
 */
export function CriterionFields({ control, path, index, onRemove, canRemove }) {
  const criterionType = useWatch({ control, name: `${path}.criterionType` });
  const hasReminder = useWatch({ control, name: `${path}.hasReminder` });
  const met = useWatch({ control, name: `${path}.met` });
  const humanActioned = isHumanActioned(criterionType);

  return (
    <Box>
      {index > 0 ? <Divider sx={{ mb: 2 }} /> : null}
      <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <RhfSelect
            name={`${path}.criterionType`}
            control={control}
            label={`Criterion ${index + 1}`}
            required
            options={CRITERION_OPTIONS}
          />
        </Grid>

        {criterionType === 'FIXED_DATE' ? (
          <Grid size={{ xs: 12, sm: 3 }}>
            <RhfTextField
              name={`${path}.releaseDate`}
              control={control}
              label="Release date"
              required
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        ) : null}

        {criterionType === 'MILESTONE_BASED' ? (
          <>
            <Grid size={{ xs: 12, sm: 4 }}>
              <RhfTextField
                name={`${path}.milestoneName`}
                control={control}
                label="Milestone name"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <RhfSelect
                name={`${path}.verificationRole`}
                control={control}
                label="Verification sign-off"
                required
                options={VERIFICATION_ROLES}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <RhfTextField
                name={`${path}.targetDate`}
                control={control}
                label="Target date"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Optional — some milestones are event-driven"
              />
            </Grid>
          </>
        ) : null}

        {criterionType === 'UTILISATION_THRESHOLD' ? (
          <>
            <Grid size={{ xs: 6, sm: 2 }}>
              <RhfTextField
                name={`${path}.utilisationPercent`}
                control={control}
                label="Utilisation %"
                required
                type="number"
                slotProps={{ htmlInput: { min: 1, max: 100, step: '0.01' } }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <RhfSelect
                name={`${path}.triggerBasis`}
                control={control}
                label="Trigger basis"
                required
                options={TRIGGER_BASES}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <RhfTextField name={`${path}.description`} control={control} label="Description" />
            </Grid>
          </>
        ) : null}

        {criterionType === 'OTHER' ? (
          <Grid size={{ xs: 12, sm: 7 }}>
            <RhfTextField
              name={`${path}.description`}
              control={control}
              label="Description"
              required
            />
          </Grid>
        ) : null}

        <Grid size={{ xs: 12, sm: 'auto' }} sx={{ ml: 'auto' }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
            {met ? <Chip size="small" color="success" label="Met" /> : null}
            {canRemove ? (
              <IconButton aria-label={`Remove criterion ${index + 1}`} onClick={onRemove}>
                <DeleteOutlineIcon />
              </IconButton>
            ) : null}
          </Stack>
        </Grid>

        {humanActioned ? (
          <Grid size={{ xs: 12 }}>
            <Controller
              name={`${path}.hasReminder`}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Remind someone about this"
                />
              )}
            />
          </Grid>
        ) : null}

        {humanActioned && hasReminder ? (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ pl: 2, borderLeft: 2, borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Counts down from the tranche&apos;s expected release date minus the lead time. The deputy is
                notified only — approval stays with the responsible role.
              </Typography>
              <Grid container spacing={1.5} sx={{ mt: 0.5, alignItems: 'flex-start' }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfSelect
                    name={`${path}.reminder.responsibleRole`}
                    control={control}
                    label="Responsible role"
                    required
                    options={RESPONSIBLE_ROLES}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <RhfTextField
                    name={`${path}.reminder.reminderLeadDays`}
                    control={control}
                    label="Lead time (days)"
                    required
                    type="number"
                    slotProps={{ htmlInput: { min: 0, max: 365 } }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <RhfSelect
                    name={`${path}.reminder.repeatReminder`}
                    control={control}
                    label="Repeat"
                    options={REPEAT_REMINDERS}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 2 }}>
                  <Controller
                    name={`${path}.reminder.escalateToDeputy`}
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        sx={{ mt: 1 }}
                        control={
                          <Switch
                            checked={field.value !== false}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Deputy"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
}
