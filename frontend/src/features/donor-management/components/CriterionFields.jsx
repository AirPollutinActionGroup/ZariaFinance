import { Box, Button, Chip, Divider, FormControlLabel, Grid, IconButton, Stack, Switch, Typography } from '@mui/material';
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
 * Single Criterion Box component matching the exact prototype HTML/UI spec.
 */
export function CriterionFields({
  control,
  path,
  index,
  onRemove,
  canRemove = true,
  responsibleRoleOptions = RESPONSIBLE_ROLES,
}) {
  const criterionType = useWatch({ control, name: `${path}.criterionType` });
  const verificationRole = useWatch({ control, name: `${path}.verificationRole` });
  const responsibleRole = useWatch({ control, name: `${path}.reminder.responsibleRole` });
  const hasReminder = useWatch({ control, name: `${path}.hasReminder` });
  const humanActioned = isHumanActioned(criterionType);
  const numStr = String(index + 1).padStart(2, '0');

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
        bgcolor: '#fdfdfb',
        mb: 1.5,
      }}
    >
      {/* Criterion Header Row */}
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: criterionType ? 1.5 : 0 }}>
        <Typography
          variant="caption"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 13,
            color: 'text.secondary',
            minWidth: 20,
          }}
        >
          {numStr}
        </Typography>
        <Typography
          id={`criterion-type-label-${path}`}
          sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}
        >
          {`Criterion ${index + 1}`}
        </Typography>

        <Box sx={{ flexGrow: 1, maxWidth: 340 }}>
          <RhfSelect
            name={`${path}.criterionType`}
            control={control}
            label={undefined}
            options={[
              { value: '', label: 'Select criterion type…' },
              ...CRITERION_OPTIONS,
            ]}
            slotProps={{
              select: {
                labelId: `criterion-type-label-${path}`,
                displayEmpty: true,
                renderValue: (selected) => {
                  if (!selected) {
                    return <span style={{ color: '#9a9a94', fontWeight: 400 }}>Select criterion type…</span>;
                  }
                  return CRITERION_OPTIONS.find((opt) => opt.value === selected)?.label || selected;
                },
              },
            }}
          />
        </Box>

        {canRemove ? (
          <Button
            type="button"
            onClick={onRemove}
            sx={{
              ml: 'auto',
              color: '#B4441B',
              fontWeight: 600,
              fontSize: 13,
              textTransform: 'none',
              minWidth: 'auto',
              p: 0,
              '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
            }}
          >
            Remove
          </Button>
        ) : null}
      </Stack>

      {/* Dynamic Fields Grid */}
      <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        {criterionType === 'FIXED_DATE' ? (
          <Grid size={{ xs: 12, sm: 6 }}>
            <RhfTextField
              name={`${path}.releaseDate`}
              control={control}
              label="Release date *"
              required
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
        ) : null}

        {criterionType === 'MILESTONE_BASED' ? (
          <>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RhfTextField
                name={`${path}.milestoneName`}
                control={control}
                label="Milestone name *"
                placeholder="e.g. Teacher training completed"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RhfSelect
                name={`${path}.verificationRole`}
                control={control}
                label="Verification sign-off role *"
                required
                options={VERIFICATION_ROLES}
              />
            </Grid>
            {verificationRole === 'OTHER' ? (
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField
                  name={`${path}.otherVerificationRole`}
                  control={control}
                  label="Specify verification role *"
                  placeholder="e.g. Independent Auditor"
                  required
                />
              </Grid>
            ) : null}
            <Grid size={{ xs: 12, sm: 6 }}>
              <RhfTextField
                name={`${path}.targetDate`}
                control={control}
                label="Target date (Optional)"
                type="date"
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Optional — some milestones are event-driven"
              />
            </Grid>
          </>
        ) : null}

        {criterionType === 'UTILISATION_THRESHOLD' ? (
          <>
            <Grid size={{ xs: 6, sm: 4 }}>
              <RhfTextField
                name={`${path}.utilisationPercent`}
                control={control}
                label="Utilisation % *"
                required
                type="number"
                placeholder="80"
                slotProps={{ htmlInput: { min: 1, max: 100, step: '0.01' } }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <RhfSelect
                name={`${path}.triggerBasis`}
                control={control}
                label="Trigger basis *"
                required
                options={TRIGGER_BASES}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <RhfTextField name={`${path}.description`} control={control} label="Description (Optional)" />
            </Grid>
          </>
        ) : null}

        {criterionType === 'OTHER' ? (
          <Grid size={{ xs: 12 }}>
            <RhfTextField
              name={`${path}.description`}
              control={control}
              label="Description *"
              placeholder="Describe the release condition…"
              required
            />
          </Grid>
        ) : null}

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
            <Box
              sx={{
                mt: 1.5,
                p: 2,
                borderRadius: 2,
                border: '1px dashed #cfcfc7',
                bgcolor: '#fbfbf7',
              }}
            >
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  Reminder & escalation
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11.5 }}>
                  runs against the release date
                </Typography>
              </Stack>

              <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfSelect
                    name={`${path}.reminder.responsibleRole`}
                    control={control}
                    label="Responsible role *"
                    required
                    options={responsibleRoleOptions}
                  />
                </Grid>
                {responsibleRole === 'OTHER' ? (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RhfTextField
                      name={`${path}.reminder.otherResponsibleRole`}
                      control={control}
                      label="Specify responsible role *"
                      placeholder="e.g. Field Officer"
                      required
                    />
                  </Grid>
                ) : null}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField
                    name={`${path}.reminder.reminderLeadDays`}
                    control={control}
                    label="Reminder lead time *"
                    required
                    type="number"
                    placeholder="7"
                    helperText="Days before the release date."
                    slotProps={{ htmlInput: { min: 0, max: 365 } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfSelect
                    name={`${path}.reminder.repeatReminder`}
                    control={control}
                    label="Repeat reminder"
                    options={REPEAT_REMINDERS}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                    Escalate to deputy
                  </Typography>
                  <Controller
                    name={`${path}.reminder.escalateToDeputy`}
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value !== false}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label={
                          <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            {field.value !== false ? 'On — deputy is notified only' : 'Off'}
                          </Typography>
                        }
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 1.5,
                  p: 1.2,
                  px: 1.5,
                  borderRadius: 1.5,
                  bgcolor: '#FBF6C4',
                  border: '1px solid #ece2a3',
                  fontSize: 12,
                  color: '#5f5713',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                Set a lead time to preview when reminders begin.
              </Box>
            </Box>
          </Grid>
        ) : null}
      </Grid>
    </Box>
  );
}
