import { Alert, Box, Button, Card, CardContent, Chip, Grid, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useFieldArray, useWatch } from 'react-hook-form';
import { RhfTextField } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { CriterionFields } from './CriterionFields.jsx';
import { criterionTypeLabel, emptyCriterion } from '../mappers/disbursementMapper.js';

/**
 * One tranche (Disbursement Rules §3) with its release criteria (§4).
 *
 * Editing shows the full form; once saved the card collapses to the summary the
 * spec describes, with an Edit action. A tranche whose receipt is recorded cannot
 * be re-priced or removed — the server refuses either way, so the UI says so
 * rather than letting the user discover it on save.
 */
export function TrancheCard({
  control,
  index,
  path,
  expanded,
  onToggleExpanded,
  onRemove,
  frequencyLabel,
  lumpSum,
  isFinal,
}) {
  const criteria = useFieldArray({ control, name: `${path}.criteria` });
  const tranche = useWatch({ control, name: path });
  const received = Boolean(tranche?.received);

  const title = lumpSum ? 'Lump sum release' : `Tranche ${index + 1}`;

  if (!expanded) {
    return (
      <Card variant="outlined">
        <CardContent sx={{ p: 2.5 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" component="h3">{title}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                <strong>Amount:</strong> {formatInrExact(tranche?.amount)}
              </Typography>
              <Typography variant="body2">
                <strong>Expected release date:</strong>{' '}
                {tranche?.expectedReleaseDate
                  ? formatDate(tranche.expectedReleaseDate)
                  : isFinal ? 'Not applicable' : '—'}
              </Typography>
              {frequencyLabel ? (
                <Typography variant="body2">
                  <strong>Frequency:</strong> {frequencyLabel}
                </Typography>
              ) : null}

              <Typography variant="subtitle2" sx={{ mt: 1.5 }}>Release criteria</Typography>
              <Stack component="ol" sx={{ m: 0, pl: 2.5 }} spacing={0.25}>
                {(tranche?.criteria || []).map((criterion, i) => (
                  <li key={criterion.id ?? `new-${i}`}>
                    <Typography variant="body2" component="span">
                      {criterionTypeLabel(criterion.criterionType)}
                      {criterion.milestoneName ? ` — ${criterion.milestoneName}` : ''}
                      {criterion.utilisationPercent ? ` — ${criterion.utilisationPercent}%` : ''}
                      {criterion.met ? ' · met' : ''}
                    </Typography>
                  </li>
                ))}
              </Stack>
            </Box>
            <Stack spacing={1} sx={{ alignItems: 'flex-end' }}>
              {received ? <Chip size="small" color="success" label="Received" /> : null}
              <Button size="small" startIcon={<EditOutlinedIcon />} onClick={onToggleExpanded}>
                Edit
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" component="h3">{title}</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            {received ? <Chip size="small" color="success" label="Received" /> : null}
            <Button size="small" onClick={onToggleExpanded}>Done</Button>
            {!lumpSum && !received ? (
              <Button size="small" color="error" startIcon={<DeleteOutlineIcon />} onClick={onRemove}>
                Remove
              </Button>
            ) : null}
          </Stack>
        </Stack>

        {received ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            This tranche&apos;s receipt is recorded, so its amount is locked and it cannot be removed.
          </Alert>
        ) : null}

        <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <RhfTextField name={`${path}.trancheName`} control={control} label="Tranche name" />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <RhfTextField
              name={`${path}.amount`}
              control={control}
              label="Amount"
              required
              type="number"
              disabled={received || lumpSum}
              helperText={
                lumpSum
                  ? 'The full committed amount'
                  : received
                    ? 'Locked — receipt recorded'
                    : undefined
              }
              slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <RhfTextField
              name={`${path}.expectedReleaseDate`}
              control={control}
              label="Expected release date"
              type="date"
              disabled={lumpSum}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText={
                lumpSum
                  ? 'Taken from the receiving date'
                  : isFinal
                    ? 'Optional for the final tranche'
                    : undefined
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            {/* Read-only echo of the schedule cadence, per the spec. */}
            <TextField
              label="Frequency"
              value={frequencyLabel || (lumpSum ? 'Not applicable' : '—')}
              disabled
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              helperText=" "
            />
          </Grid>
        </Grid>

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 1 }}>
          <Typography variant="subtitle2">Release criteria</Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={() => criteria.append(emptyCriterion())}
          >
            Add criteria
          </Button>
        </Stack>

        <Stack spacing={2}>
          {criteria.fields.map((field, i) => (
            <CriterionFields
              key={field.id}
              control={control}
              path={`${path}.criteria.${i}`}
              index={i}
              canRemove={criteria.fields.length > 1}
              onRemove={() => criteria.remove(i)}
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
