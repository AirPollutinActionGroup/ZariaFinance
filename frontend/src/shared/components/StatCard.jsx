import { Card, CardContent, Typography } from '@mui/material';

/**
 * KPI tile used on dashboards.
 */
export function StatCard({ label, value, hint = null, emphasis = false, highlight = false }) {
  const isEmphasis = emphasis || highlight;

  return (
    <Card
      sx={
        isEmphasis
          ? { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' }
          : undefined
      }
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Typography
          variant="overline"
          component="p"
          sx={{
            color: isEmphasis ? 'rgba(252, 251, 248, 0.7)' : 'text.secondary',
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h3"
          component="p"
          sx={{ color: 'inherit' }}
        >
          {value}
        </Typography>
        {hint ? (
          <Typography
            variant="caption"
            sx={{
              color: isEmphasis ? 'rgba(252, 251, 248, 0.7)' : 'text.secondary',
              display: 'block',
              mt: 0.5,
            }}
          >
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
