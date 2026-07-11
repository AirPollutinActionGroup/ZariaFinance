import { Card, CardActionArea, CardContent, Typography } from '@mui/material';

/**
 * KPI tile used on dashboards. Pass `onClick` to make the whole tile an
 * accessible button (e.g. to open a quick-look pop-up).
 */
export function StatCard({
  label,
  value,
  hint = null,
  emphasis = false,
  highlight = false,
  accent = false,
  onClick = null,
}) {
  const isEmphasis = emphasis || highlight;

  const softColor = isEmphasis ? { color: 'primary.contrastText', opacity: 0.7 } : { color: 'text.secondary' };

  const body = (
    <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
      <Typography variant="overline" component="p" sx={{ ...softColor, mb: 0.75 }}>
        {label}
      </Typography>
      <Typography
        variant="h3"
        component="p"
        sx={{
          color: accent && !isEmphasis ? 'success.main' : 'inherit',
          fontSize: 26,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" sx={{ ...softColor, display: 'block', mt: 0.5 }}>
          {hint}
        </Typography>
      ) : null}
    </CardContent>
  );

  return (
    <Card
      sx={
        isEmphasis
          ? { bgcolor: 'primary.main', color: 'primary.contrastText', borderColor: 'primary.main' }
          : undefined
      }
    >
      {onClick ? (
        <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
          {body}
        </CardActionArea>
      ) : (
        body
      )}
    </Card>
  );
}
