import { Stack, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

/** `compact` is a smaller version for empty tables inside a detail page. */
export function EmptyState({ title, description = '', action = null, compact = false }) {
  return (
    <Stack
      alignItems="center"
      spacing={compact ? 0.75 : 1.5}
      sx={{ py: compact ? 3 : 8, px: 3, textAlign: 'center' }}
    >
      <InboxOutlinedIcon sx={{ fontSize: compact ? 28 : 40, color: 'text.secondary' }} />
      <Typography variant={compact ? 'body2' : 'h4'} component="p" sx={compact ? { fontWeight: 600 } : undefined}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
          {description}
        </Typography>
      ) : null}
      {action}
    </Stack>
  );
}
