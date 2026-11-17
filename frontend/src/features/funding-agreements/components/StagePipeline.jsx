import { Box, ButtonBase, Card, Stack, Tooltip, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { formatInr } from '../../../lib/format/currency.js';
import { STAGES } from '../lib/fundingRecords.js';

const overlineSx = {
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontSize: 10.5,
  fontWeight: 600,
  color: 'text.secondary',
};

/**
 * The whole register as a left-to-right pipeline: one tile per lifecycle stage
 * with its count and committed value. Clicking a tile filters the table to it
 * (click again to clear). Figures always describe the full register.
 */
export function StagePipeline({ records, activeStage, onStageClick }) {
  const byStage = Object.fromEntries(STAGES.map((s) => [s.key, { count: 0, committed: 0 }]));
  for (const r of records) {
    byStage[r.stage].count += 1;
    byStage[r.stage].committed += r.committed;
  }
  const total = records.reduce((sum, r) => sum + r.committed, 0);
  const donors = new Set(records.map((r) => r.donorId ?? r.donorName)).size;

  return (
    <Card sx={{ mb: 2.5, overflow: 'hidden' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 0.5, sm: 4 }}
        sx={{ px: 2.5, pt: 1.75, pb: 1.25, alignItems: { sm: 'baseline' } }}
      >
        <Box>
          <Typography component="span" sx={overlineSx}>
            Total committed
          </Typography>
          <Typography sx={{ fontSize: 24, fontWeight: 700, lineHeight: 1.25, fontVariantNumeric: 'tabular-nums' }}>
            {formatInr(total)}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {records.length} funding record{records.length === 1 ? '' : 's'} from {donors} donor{donors === 1 ? '' : 's'}
          {byStage.terms.count ? (
            <Box component="span" sx={{ color: 'var(--warn)', fontWeight: 600 }}>
              {' '}
              · {byStage.terms.count} still need an agreement
            </Box>
          ) : null}
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: `repeat(${STAGES.length}, 1fr)` },
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {STAGES.map((stage, index) => {
          const { count, committed } = byStage[stage.key];
          const active = activeStage === stage.key;
          return (
            <Tooltip key={stage.key} title={`${stage.hint} — click to ${active ? 'show all' : 'filter'}`}>
              <ButtonBase
                onClick={() => onStageClick(active ? 'all' : stage.key)}
                aria-pressed={active}
                sx={{
                  position: 'relative',
                  display: 'block',
                  textAlign: 'left',
                  px: 2.5,
                  py: 1.5,
                  borderRight: { md: index < STAGES.length - 1 ? '1px solid' : 'none' },
                  borderBottom: { xs: '1px solid', md: 'none' },
                  borderColor: 'divider',
                  bgcolor: active ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                  // Stage colour as a bar along the top edge — thicker when selected.
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '0 0 auto 0',
                    height: active ? 4 : 2,
                    bgcolor: stage.color,
                    opacity: count ? 1 : 0.35,
                  },
                }}
              >
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ ...overlineSx, color: active ? 'text.primary' : 'text.secondary' }}>
                    {stage.label}
                  </Typography>
                  {index < STAGES.length - 1 ? (
                    <ChevronRightIcon sx={{ fontSize: 14, color: 'text.disabled', display: { xs: 'none', md: 'block' } }} />
                  ) : null}
                </Stack>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    fontVariantNumeric: 'tabular-nums',
                    color: count ? 'text.primary' : 'text.disabled',
                  }}
                >
                  {count}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {count ? formatInr(committed) : '—'}
                </Typography>
              </ButtonBase>
            </Tooltip>
          );
        })}
      </Box>
    </Card>
  );
}
