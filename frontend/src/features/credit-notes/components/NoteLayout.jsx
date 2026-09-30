import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

export const MONEY_SX = { fontVariantNumeric: 'tabular-nums' };

/** Section card in the app's form style: icon badge, "01" number, title, one-line hint. `color` is a palette key. */
export function FormSection({ number, icon: Icon, title, description, action = null, color = 'success', children }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
      <CardContent sx={{ p: { xs: 2.25, sm: 2.75 } }}>
        <Stack direction="row" spacing={1.75} alignItems="center" sx={{ mb: 2.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`,
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
          <Box flex={1}>
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="caption" sx={{ fontWeight: 700, color: `${color}.main`, letterSpacing: '0.06em' }}>
                {number}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            </Stack>
            {description ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {description}
              </Typography>
            ) : null}
          </Box>
          {action}
        </Stack>
        <Grid container spacing={2}>
          {children}
        </Grid>
      </CardContent>
    </Card>
  );
}

/** One labelled figure in a summary strip. */
export function Figure({ label, value, color, strong = false }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10.5 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ ...MONEY_SX, fontWeight: strong ? 700 : 600, color }}>
        {value}
      </Typography>
    </Box>
  );
}

/** Label/value row in the register style used on detail pages. */
export function TermRow({ label, children, last = false }) {
  return (
    <Stack direction="row" spacing={2} sx={{ py: 1.5, alignItems: 'center', borderBottom: last ? 'none' : '1px solid', borderColor: 'divider' }}>
      <Typography
        variant="caption"
        sx={{ width: { xs: 130, sm: 170 }, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}
      >
        {label}
      </Typography>
      <Box sx={{ minWidth: 0 }}>
        {typeof children === 'string' || typeof children === 'number' ? <Typography variant="body1">{children}</Typography> : children}
      </Box>
    </Stack>
  );
}

/** Soft background + strong colour per tone, for icon badges and banners. */
export const TONE_COLORS = {
  success: { bg: 'var(--ok-bg)', fg: 'success.main' },
  error: { bg: 'var(--err-bg)', fg: 'error.main' },
};

/** Detail-page card with an icon badge + title, matching the form's section headers. */
export function Panel({ icon: Icon, title, action = null, tone = 'success', children }) {
  const { bg, fg } = TONE_COLORS[tone] || TONE_COLORS.success;
  return (
    <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
      <Box sx={{ p: { xs: 2.25, sm: 2.75 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              bgcolor: bg,
              color: fg,
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>
            {title}
          </Typography>
          {action}
        </Stack>
        {children}
      </Box>
    </Card>
  );
}

/** One labelled fact in a detail-page summary banner. */
export function Fact({ label, children }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10.5, mb: 0.5 }}>
        {label}
      </Typography>
      {typeof children === 'string' ? (
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap title={children}>
          {children}
        </Typography>
      ) : (
        children
      )}
    </Box>
  );
}

export function SectionCard({ title, action = null, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h4" component="h2">{title}</Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}
