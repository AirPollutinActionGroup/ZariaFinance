import { Box, Card, Stack, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

/**
 * One step of a long form as a single card: a header band (step marker,
 * "Step n of N", title, hint, optional action) above the step's content.
 *
 * status: 'todo' | 'done' | 'skipped'. `flush` drops the body padding for
 * content that brings its own (e.g. a list of bordered sections).
 */
export function FormStep({ id, step, total, title, subtitle, status = 'todo', action = null, flush = false, children }) {
  const done = status === 'done';
  const skipped = status === 'skipped';
  const stateLabel = done ? 'Complete' : skipped ? 'Skipped' : null;

  return (
    <Card id={id} component="section" sx={{ overflow: 'hidden', scrollMarginTop: 16 }}>
      <Stack
        direction="row"
        spacing={1.75}
        sx={{
          px: { xs: 2, md: 3 },
          py: 2,
          alignItems: 'center',
          bgcolor: 'var(--card2)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            fontSize: 14,
            fontWeight: 700,
            bgcolor: done ? 'var(--ok)' : skipped ? 'transparent' : 'var(--ink)',
            color: done || !skipped ? 'var(--card)' : 'var(--muted)',
            border: skipped ? '1px dashed var(--line)' : 'none',
          }}
        >
          {done ? <CheckIcon sx={{ fontSize: 18 }} /> : step}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary' }}
          >
            Step {step} of {total}
            {stateLabel ? (
              <Box component="span" sx={{ ml: 1, color: done ? 'var(--ok)' : 'text.secondary' }}>
                · {stateLabel}
              </Box>
            ) : null}
          </Typography>
          <Typography component="h2" sx={{ fontSize: 17, fontWeight: 700, lineHeight: 1.35 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {action}
      </Stack>
      <Box sx={flush ? undefined : { px: { xs: 2, md: 3 }, py: 2.5 }}>{children}</Box>
    </Card>
  );
}
