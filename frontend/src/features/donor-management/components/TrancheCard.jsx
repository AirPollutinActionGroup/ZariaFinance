import {
  Alert,
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
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import { RhfTextField } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { CriterionFields } from './CriterionFields.jsx';
import { criterionTypeLabel, emptyCriterion } from '../mappers/disbursementMapper.js';

/**
 * Single Tranche Card component matching the exact prototype HTML/UI spec.
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
  isFinal: isFinalProp,
  singleCriterion = false,
  responsibleRoleOptions,
}) {
  const criteria = useFieldArray({ control, name: `${path}.criteria` });
  const tranche = useWatch({ control, name: path });
  const received = Boolean(tranche?.received);

  const tag = `T${index + 1}`;
  const title = lumpSum ? 'Lump sum release' : (tranche?.trancheName || 'New tranche');

  // COLLAPSED SUMMARY CARD
  if (!expanded) {
    return (
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2.5,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          mb: 2,
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 2,
            px: 2.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'var(--card2, #fbfbf9)',
          }}
        >
          <Box
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              bgcolor: '#181818',
              color: '#fff',
              px: 1.2,
              py: 0.4,
              borderRadius: 1.5,
              fontSize: 12,
            }}
          >
            {tag}
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: 14 }}>
            {title}
          </Typography>
          {received ? <Chip size="small" color="success" label="Received" sx={{ ml: 1 }} /> : null}
          <Typography
            variant="h6"
            sx={{
              ml: 'auto',
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {formatInrExact(tranche?.amount || 0)}
          </Typography>
        </Box>

        {/* Card Body */}
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={3} sx={{ fontSize: 13 }}>
              <Box>
                <Typography component="span" sx={{ color: 'text.secondary' }}>Expected release: </Typography>
                <Typography component="span" sx={{ fontWeight: 600 }}>
                  {tranche?.expectedReleaseDate ? formatDate(tranche.expectedReleaseDate) : isFinalProp ? 'N/A (final tranche)' : '—'}
                </Typography>
              </Box>
              <Box>
                <Typography component="span" sx={{ color: 'text.secondary' }}>Frequency: </Typography>
                <Typography component="span" sx={{ fontWeight: 600 }}>
                  {frequencyLabel || (lumpSum ? 'Not applicable' : '—')}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ borderStyle: 'dashed', my: 1 }} />

            <Box>
              <Typography
                variant="caption"
                sx={{
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'text.secondary',
                  fontWeight: 700,
                  display: 'block',
                  mb: 1,
                }}
              >
                Release criteria
              </Typography>

              <Stack spacing={1}>
                {(tranche?.criteria || []).map((c, i) => {
                  const sys = c.criterionType === 'UTILISATION_THRESHOLD' || c.criterionType === 'ON_SIGNING';
                  return (
                    <Stack key={c.id ?? i} direction="row" spacing={1} sx={{ alignItems: 'baseline', fontSize: 12.5 }}>
                      <Chip
                        label={criterionTypeLabel(c.criterionType).toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: 10.5,
                          borderRadius: 1,
                          bgcolor: sys ? '#E3F3EA' : '#181818',
                          color: sys ? '#1f7a4d' : '#fff',
                          border: sys ? '1px solid #bfe0cc' : 'none',
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12.5 }}>
                        {c.milestoneName ? `"${c.milestoneName}"` : ''}
                        {c.verificationRole ? ` · verified by ${c.verificationRole}` : ''}
                        {c.utilisationPercent ? `${c.utilisationPercent}% · ${c.triggerBasis || 'Previous Tranche'}` : ''}
                        {c.hasReminder && c.reminder?.reminderLeadDays
                          ? ` · reminder ${c.reminder.reminderLeadDays}d before to ${c.reminder.responsibleRole || 'Responsible'}${c.reminder.escalateToDeputy ? ' (escalates)' : ''}`
                          : ''}
                        {c.met ? ' · met' : ''}
                      </Typography>
                    </Stack>
                  );
                })}
                {(tranche?.criteria || []).length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No release criteria specified yet.
                  </Typography>
                ) : null}
              </Stack>
            </Box>
          </Stack>

          {/* Footer Actions */}
          <Stack direction="row" spacing={1} sx={{ mt: 2.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              size="small"
              variant="outlined"
              onClick={onToggleExpanded}
              sx={{ fontWeight: 600, color: 'text.primary', borderColor: 'divider' }}
            >
              Edit
            </Button>
            {!lumpSum && !received ? (
              <Button
                size="small"
                color="error"
                onClick={onRemove}
                sx={{ fontWeight: 500 }}
              >
                Delete
              </Button>
            ) : null}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // EXPANDED EDITOR CARD
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        border: '1px solid #181818',
        overflow: 'hidden',
        mb: 2,
      }}
    >
      {/* Editor Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: 2,
          px: 2.5,
          bgcolor: '#fbfbf9',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            fontFamily: 'monospace',
            fontWeight: 700,
            bgcolor: '#181818',
            color: '#fff',
            px: 1.2,
            py: 0.4,
            borderRadius: 1.5,
            fontSize: 12,
          }}
        >
          {tag}
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 14 }}>
          {title}
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          {!lumpSum && !received ? (
            <Button
              size="small"
              color="error"
              onClick={onRemove}
              sx={{ fontWeight: 600, textTransform: 'none' }}
            >
              Remove
            </Button>
          ) : null}
        </Box>
      </Box>

      {/* Editor Body */}
      <CardContent sx={{ p: 2.5 }}>
        <Typography
          variant="caption"
          sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1.5 }}
        >
          Basic details
        </Typography>

        {received ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            This tranche&apos;s receipt is recorded, so its amount is locked and it cannot be removed.
          </Alert>
        ) : null}

        <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <RhfTextField
              name={`${path}.amount`}
              control={control}
              label="Amount *"
              required
              type="number"
              disabled={received || lumpSum}
              slotProps={{
                htmlInput: { min: 0, step: '0.01' },
                input: {
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <RhfTextField
              name={`${path}.expectedReleaseDate`}
              control={control}
              label="Expected release date *"
              type="date"
              disabled={lumpSum || Boolean(tranche?.isFinal)}
              helperText={tranche?.isFinal ? 'N/A — Final tranche' : undefined}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Frequency"
              value={frequencyLabel || (lumpSum ? 'Not applicable' : '—')}
              disabled
              fullWidth
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  sx: {
                    fontWeight: 600,
                    color: '#181818',
                    '&.Mui-disabled': {
                      bgcolor: 'var(--canvas, #f4f4f0)',
                      color: '#181818',
                      WebkitTextFillColor: '#181818',
                    },
                  },
                },
              }}
              helperText="From schedule type."
            />
          </Grid>
        </Grid>

        {/* Final Tranche Toggle Container */}
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            px: 2,
            borderRadius: 2,
            bgcolor: 'var(--canvas, #f4f4f0)',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Controller
            name={`${path}.isFinal`}
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(field.value)}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
                    Mark as the final tranche{' '}
                    <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                      — release date becomes N/A
                    </Typography>
                  </Typography>
                }
              />
            )}
          />
        </Box>

        {/* Release Criteria Section */}
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="caption"
            sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 700, display: 'block', mb: 1.5 }}
          >
            Release criteria
          </Typography>

          <Stack spacing={2}>
            {criteria.fields.map((field, i) => (
              <CriterionFields
                key={field.id}
                control={control}
                path={`${path}.criteria.${i}`}
                index={i}
                canRemove={!singleCriterion && criteria.fields.length > 1}
                onRemove={() => criteria.remove(i)}
                responsibleRoleOptions={responsibleRoleOptions}
              />
            ))}
          </Stack>

          {criteria.fields.length === 0 && !singleCriterion ? (
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => criteria.append(emptyCriterion())}
              sx={{ mt: 2, borderStyle: 'dashed', textTransform: 'none', fontWeight: 600 }}
            >
              Add criteria
            </Button>
          ) : null}
        </Box>

        {/* Editor Footer Buttons */}
        <Stack direction="row" spacing={1.5} sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            type="button"
            variant="contained"
            onClick={onToggleExpanded}
            sx={{ bgcolor: '#181818', color: '#fff', '&:hover': { bgcolor: '#000' }, fontWeight: 600 }}
          >
            Save tranche
          </Button>
          <Button
            type="button"
            variant="text"
            onClick={onToggleExpanded}
            sx={{ color: 'text.secondary', fontWeight: 500 }}
          >
            Cancel
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
