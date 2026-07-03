import { Stack, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export function EmptyState({ title, description = '', action = null }) {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 8, px: 3, textAlign: 'center' }}>
      <InboxOutlinedIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
      <Typography variant="h4" component="p">
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
