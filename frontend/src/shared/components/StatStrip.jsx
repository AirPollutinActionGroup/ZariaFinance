import { Box, Card, Typography } from '@mui/material';

/**
 * A row of headline numbers in one card, split by thin dividers — e.g. the
 * counts above a list page. stats: [{ label, value, note?, color? }].
 * `footer` renders under the numbers (e.g. a progress bar).
 */
export function StatStrip({ stats, footer = null, sx }) {
  return (
    <Card sx={sx}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: `repeat(${stats.length}, 1fr)` },
          '& > *': { px: 2.5, py: 1.5 },
          '& > *:not(:last-child)': { borderRight: { md: '1px solid' }, borderColor: { md: 'divider' } },
        }}
      >
        {stats.map((s) => (
          <Box key={s.label}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              {s.label}
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, color: s.color || 'text.primary' }}>
              {s.value}
            </Typography>
            {s.note ? (
              <Typography variant="caption" color="text.secondary">
                {s.note}
              </Typography>
            ) : null}
          </Box>
        ))}
      </Box>
      {footer}
    </Card>
  );
}
