import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useWatch } from 'react-hook-form';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import {
  APPROVER_ROLE_OPTIONS,
  CRITERION_TYPE_OPTIONS,
  REPEAT_REMINDER_OPTIONS,
  TRIGGER_BASE_OPTIONS,
  isCriterionHumanActioned,
} from '../constants.js';

function criterionLabel(value) {
  return CRITERION_TYPE_OPTIONS.find((t) => t.value === value)?.label || value || '—';
}

/**
 * A single tranche row on a fund profile's disbursement schedule. Unlike the
 * grant-level disbursement tranche, a fund-profile tranche (DonorTrancheDetail)
 * carries exactly one release criterion, not a list — the fields below are that
 * criterion's, shown inline and gated by `releaseCriteria`.
 */
export function FundProfileTrancheCard({
  control,
  index,
  path,
  expanded,
  onToggleExpanded,
  onRemove,
  frequencyLabel,
  lumpSum,
}) {
  const tranche = useWatch({ control, name: path });
  const signOfRole = useWatch({ control, name: `${path}.signOfRole` });
  const responsibleRole = useWatch({ control, name: `${path}.responsibleRole` });
  const releaseCriteria = tranche?.releaseCriteria;
  const humanActioned = isCriterionHumanActioned(releaseCriteria);

  const tag = `T${index + 1}`;
  const title = lumpSum ? 'Lump sum release' : (tranche?.trancheName || `Tranche ${index + 1}`);

  if (!expanded) {
    return (
      <Card variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, px: 2.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'var(--card2, #fbfbf9)' }}>
          <Box sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: '#181818', color: '#fff', px: 1.2, py: 0.4, borderRadius: 1.5, fontSize: 12 }}>
            {tag}
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 14 }}>{title}</Typography>
          {tranche?.isFinalTranche ? <Chip size="small" label="Final" sx={{ ml: 1 }} /> : null}
          <Typography variant="h6" sx={{ ml: 'auto', fontFamily: 'monospace', fontWeight: 700, fontSize: 16 }}>
            {formatInrExact(tranche?.amount || 0)}
          </Typography>
        </Box>

        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={3} sx={{ fontSize: 13 }}>
              <Box>
                <Typography component="span" sx={{ color: 'text.secondary' }}>Frequency: </Typography>
                <Typography component="span" sx={{ fontWeight: 600 }}>{frequencyLabel || (lumpSum ? 'Not applicable' : '—')}</Typography>
              </Box>
              {tranche?.releaseDate ? (
                <Box>
                  <Typography component="span" sx={{ color: 'text.secondary' }}>Release date: </Typography>
                  <Typography component="span" sx={{ fontWeight: 600 }}>{formatDate(tranche.releaseDate)}</Typography>
                </Box>
              ) : null}
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

            <Box>
              <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1 }}>
                Release criteria
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', fontSize: 12.5 }}>
                <Chip
                  label={criterionLabel(releaseCriteria).toUpperCase()}
                  size="small"
                  sx={{ fontWeight: 700, fontSize: 10.5, borderRadius: 1, bgcolor: '#181818', color: '#fff' }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12.5 }}>
                  {tranche?.milestoneName ? `"${tranche.milestoneName}"` : ''}
                  {tranche?.utilisationPercentage ? `${tranche.utilisationPercentage}% · ${tranche.triggerBase || 'Previous Tranche'}` : ''}
                  {tranche?.hasReminder && tranche?.reminderLeadTime
                    ? ` · reminder ${tranche.reminderLeadTime}d before to ${tranche.responsibleRole || 'Responsible'}${tranche.escalateToDeputy ? ' (escalates)' : ''}`
                    : ''}
                </Typography>
              </Stack>
              {!releaseCriteria ? (
                <Typography variant="caption" color="text.secondary">No release criterion specified yet.</Typography>
              ) : null}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 2.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button size="small" variant="outlined" onClick={onToggleExpanded} sx={{ fontWeight: 600, color: 'text.primary', borderColor: 'divider' }}>
              Edit
            </Button>
            {!lumpSum ? (
              <Button size="small" color="error" onClick={onRemove} sx={{ fontWeight: 500 }}>
                Delete
              </Button>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid #181818', overflow: 'hidden', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, px: 2.5, bgcolor: '#fbfbf9', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ fontFamily: 'monospace', fontWeight: 700, bgcolor: '#181818', color: '#fff', px: 1.2, py: 0.4, borderRadius: 1.5, fontSize: 12 }}>
          {tag}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 14 }}>{title}</Typography>
        <Box sx={{ ml: 'auto' }}>
          {!lumpSum ? (
            <Button size="small" color="error" onClick={onRemove} sx={{ fontWeight: 600, textTransform: 'none' }}>
              Remove
            </Button>
          ) : null}
        </Box>
      </Box>

      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1.5 }}>
          Basic details
        </Typography>

        <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <RhfTextField
              name={`${path}.amount`}
              control={control}
              label="Amount *"
              required
              type="number"
              disabled={lumpSum}
              slotProps={{ htmlInput: { min: 0, step: '0.01' }, input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Frequency"
              value={frequencyLabel || (lumpSum ? 'Not applicable' : '—')}
              disabled
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              helperText="From schedule type."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <RhfTextField name={`${path}.trancheName`} control={control} label="Tranche name (Optional)" placeholder={`Tranche ${index + 1}`} />
          </Grid>
        </Grid>

        {!lumpSum ? (
          <Box sx={{ mt: 2, p: 1.5, px: 2, borderRadius: 2, bgcolor: 'var(--canvas, #f4f4f0)', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Controller
              name={`${path}.isFinalTranche`}
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={Boolean(field.value)} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={<Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>Mark as the final tranche</Typography>}
                />
              )}
            />
          </Box>
        ) : null}

        <Box sx={{ mt: 3 }}>
          <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1.5 }}>
            Release criteria
          </Typography>

          <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RhfSelect
                name={`${path}.releaseCriteria`}
                control={control}
                label="Release criterion *"
                required
                options={[{ value: '', label: 'Select criterion type…' }, ...CRITERION_TYPE_OPTIONS]}
              />
            </Grid>

            {releaseCriteria === 'FIXED_DATE' ? (
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField name={`${path}.releaseDate`} control={control} label="Release date *" required type="date" slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
            ) : null}

            {releaseCriteria === 'MILESTONE_BASED' ? (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField name={`${path}.milestoneName`} control={control} label="Milestone name *" placeholder="e.g. Teacher training completed" required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfSelect name={`${path}.signOfRole`} control={control} label="Verification sign-off role *" required options={APPROVER_ROLE_OPTIONS} />
                </Grid>
                {signOfRole === 'OTHER' ? (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RhfTextField name={`${path}.otherSignOfRole`} control={control} label="Specify sign-off role *" placeholder="e.g. Independent Auditor" required />
                  </Grid>
                ) : null}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField name={`${path}.targetDate`} control={control} label="Target date (Optional)" type="date" slotProps={{ inputLabel: { shrink: true } }} />
                </Grid>
              </>
            ) : null}

            {releaseCriteria === 'UTILISATION_THRESHOLD' ? (
              <>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <RhfTextField name={`${path}.utilisationPercentage`} control={control} label="Utilisation % *" required type="number" placeholder="80" slotProps={{ htmlInput: { min: 1, max: 100, step: '0.01' } }} />
                </Grid>
                <Grid size={{ xs: 6, sm: 4 }}>
                  <RhfSelect name={`${path}.triggerBase`} control={control} label="Trigger basis *" required options={TRIGGER_BASE_OPTIONS} />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfTextField name={`${path}.description`} control={control} label="Description (Optional)" />
                </Grid>
              </>
            ) : null}

            {releaseCriteria === 'OTHER' ? (
              <Grid size={{ xs: 12 }}>
                <RhfTextField name={`${path}.description`} control={control} label="Description *" placeholder="Describe the release condition…" required />
              </Grid>
            ) : null}
          </Grid>

          {humanActioned ? (
            <Box sx={{ mt: 2, p: 2, borderRadius: 2, border: '1px dashed #cfcfc7', bgcolor: '#fbfbf7' }}>
              <Controller
                name={`${path}.hasReminder`}
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={Boolean(field.value)} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={<Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 12.5 }}>Reminder &amp; escalation</Typography>}
                  />
                )}
              />

              {tranche?.hasReminder ? (
                <Grid container spacing={1.5} sx={{ alignItems: 'flex-start', mt: 1 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RhfSelect name={`${path}.responsibleRole`} control={control} label="Responsible role *" required options={APPROVER_ROLE_OPTIONS} />
                  </Grid>
                  {responsibleRole === 'OTHER' ? (
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <RhfTextField name={`${path}.otherResponsibleRole`} control={control} label="Specify responsible role *" placeholder="e.g. Field Officer" required />
                    </Grid>
                  ) : null}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RhfTextField name={`${path}.reminderLeadTime`} control={control} label="Reminder lead time (days) *" required type="number" placeholder="7" slotProps={{ htmlInput: { min: 0, max: 365 } }} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RhfSelect name={`${path}.repeatReminder`} control={control} label="Repeat reminder" options={REPEAT_REMINDER_OPTIONS} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Controller
                      name={`${path}.escalateToDeputy`}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={<Switch checked={Boolean(field.value)} onChange={(e) => field.onChange(e.target.checked)} />}
                          label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Escalate to deputy</Typography>}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              ) : null}
            </Box>
          ) : null}
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button type="button" variant="contained" onClick={onToggleExpanded} sx={{ bgcolor: '#181818', color: '#fff', '&:hover': { bgcolor: '#000' }, fontWeight: 600 }}>
            Save tranche
          </Button>
          <Button type="button" variant="text" onClick={onToggleExpanded} sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Cancel
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
