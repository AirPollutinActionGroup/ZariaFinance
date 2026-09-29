import { Box, Button, Card, Grid, IconButton, MenuItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { formatInrExact } from '../../../lib/format/currency.js';
import { BOOK } from '../../donation-management/constants.js';
import { lineTotal, quarterTotals, budgetTotal } from '../lib/budgetMath.js';
import { QUARTERS } from '../constants.js';
import { useBudgetCategories } from '../hooks/useBudgetCategories.js';

const MONEY_SX = { fontVariantNumeric: 'tabular-nums' };

let tempId = 0;
export function newLine(overrides = {}) {
  tempId += 1;
  return {
    category: '',
    description: '',
    book: 'LC',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    ...overrides,
    id: `new-${tempId}`, // always fresh, so newLine(existing) is a safe copy
  };
}

function LineCard({ line, index, categories, errors = {}, onChange, onDuplicate, onRemove, canRemove }) {
  const set = (field) => (e) => onChange({ ...line, [field]: e.target.value });
  // Active categories, plus this line's own category if it has since been deactivated (shown, not pickable).
  const categoryOptions = categories.filter((c) => c.status === 'ACTIVE' || c.id === line.category);

  return (
    <Card variant="outlined" sx={{ p: 2, borderLeft: '3px solid', borderLeftColor: Object.keys(errors).length ? 'error.main' : 'divider' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.secondary' }}>
          Line {index + 1}
        </Typography>
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Duplicate line">
            <IconButton size="small" onClick={onDuplicate} aria-label={`Duplicate line ${index + 1}`}>
              <ContentCopyOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={canRemove ? 'Remove line' : 'A budget needs at least one line'}>
            <span>
              <IconButton size="small" onClick={onRemove} disabled={!canRemove} aria-label={`Remove line ${index + 1}`}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Category *"
            value={line.category}
            onChange={set('category')}
            error={Boolean(errors.category)}
            helperText={errors.category || (categoryOptions.length === 0 ? 'Add categories in Master → Budget Category' : undefined)}
          >
            {categoryOptions.map((c) => (
              <MenuItem key={c.id} value={c.id} disabled={c.status !== 'ACTIVE'}>
                {c.name}{c.status !== 'ACTIVE' ? ' (inactive)' : ''}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 5, md: 6 }}>
          <TextField fullWidth size="small" label="Description *" value={line.description} onChange={set('description')} error={Boolean(errors.description)} helperText={errors.description} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3, md: 2 }}>
          <TextField select fullWidth size="small" label="Book" value={line.book} onChange={set('book')}>
            {Object.keys(BOOK).map((code) => (
              <MenuItem key={code} value={code}>{code}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {QUARTERS.map((q) => (
          <Grid key={q.key} size={{ xs: 6, sm: 3, md: 2 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={`${q.label} (${q.months}) ₹`}
              value={line[q.key]}
              onChange={set(q.key)}
              error={Boolean(errors.amount)}
              slotProps={{ htmlInput: { min: 0, step: 'any', style: { textAlign: 'right' } } }}
            />
          </Grid>
        ))}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: { md: 'flex-end' } }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Line total
            </Typography>
            <Typography sx={{ ...MONEY_SX, fontWeight: 700, fontSize: 18 }}>{formatInrExact(lineTotal(line))}</Typography>
            {errors.amount ? (
              <Typography variant="caption" color="error">{errors.amount}</Typography>
            ) : null}
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}

/** Editable list of budget lines with running quarter and grand totals. */
export function BudgetLineEditor({ lines, onChange, errors = {} }) {
  const categories = useBudgetCategories();
  const update = (id, next) => onChange(lines.map((l) => (l.id === id ? next : l)));
  const remove = (id) => onChange(lines.filter((l) => l.id !== id));
  const duplicate = (index) => onChange([...lines.slice(0, index + 1), newLine(lines[index]), ...lines.slice(index + 1)]);
  const qTotals = quarterTotals(lines);

  return (
    <Stack spacing={1.5}>
      {lines.map((line, index) => (
        <LineCard
          key={line.id}
          line={line}
          categories={categories}
          index={index}
          errors={errors[line.id]}
          onChange={(next) => update(line.id, next)}
          onDuplicate={() => duplicate(index)}
          onRemove={() => remove(line.id)}
          canRemove={lines.length > 1}
        />
      ))}

      <Box>
        <Button startIcon={<AddIcon />} onClick={() => onChange([...lines, newLine()])}>
          Add budget line
        </Button>
      </Box>

      <Card sx={{ px: 2.5, py: 1.75, bgcolor: 'var(--card2)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
            {QUARTERS.map((q) => (
              <Box key={q.key}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{q.label}</Typography>
                <Typography variant="body2" sx={{ ...MONEY_SX, fontWeight: 600 }}>{formatInrExact(qTotals[q.key])}</Typography>
              </Box>
            ))}
          </Stack>
          <Box sx={{ textAlign: { sm: 'right' } }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Budget total · {lines.length} {lines.length === 1 ? 'line' : 'lines'}
            </Typography>
            <Typography sx={{ ...MONEY_SX, fontWeight: 700, fontSize: 22 }}>{formatInrExact(budgetTotal(lines))}</Typography>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
