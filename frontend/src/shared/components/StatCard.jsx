import { Card, CardContent, Typography } from '@mui/material';
import { accent, shadows } from '../../theme/tokens.js';

/**
 * KPI tile used on dashboards. `highlight` renders the premium graphite
 * variant (the card that was yellow in the review-draft design).
 */
export function StatCard({ label, value, hint = null, highlight = false }) {
  return (
    <Card
      sx={
        highlight
          ? {
              background: accent.gradient,
              border: `1px solid ${accent.hairline}`,
              boxShadow: shadows.graphiteGlow,
            }
          : undefined
      }
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Typography
          variant="body2"
          sx={{ color: highlight ? accent.silver : 'text.secondary', mb: 1 }}
        >
          {label}
        </Typography>
        <Typography
          variant="h2"
          component="p"
          sx={{ color: highlight ? accent.platinum : 'text.primary' }}
        >
          {value}
        </Typography>
        {hint ? (
          <Typography
            variant="caption"
            sx={{ color: highlight ? accent.silver : 'text.secondary' }}
          >
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
