import { Box, Stack, Typography } from '@mui/material';

/** Standard page heading with optional eyebrow, subtitle, and action area. */
export function PageHeader({ eyebrow = null, title, subtitle = null, actions = null }) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      gap={2}
      sx={{ mb: 4, alignItems: { md: 'flex-end' }, justifyContent: 'space-between' }}
    >
      <Box>
        {eyebrow ? (
          <Typography variant="overline" color="secondary.main" sx={{ display: 'block' }}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h3" component="h1">
          {title}
        </Typography>
        {subtitle ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? <Box sx={{ flexShrink: 0 }}>{actions}</Box> : null}
    </Stack>
  );
}
