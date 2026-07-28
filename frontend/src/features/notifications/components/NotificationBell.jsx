import { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/index.js';
import { formatDateTime } from '../../../lib/format/date.js';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from '../hooks/useNotifications.js';

/**
 * Reminder inbox in the top bar.
 *
 * Hidden in review mode: notifications belong to a real user id, and review mode
 * has none (docs/BACKEND_GAPS.md #1). Showing an empty bell there would suggest
 * "nothing outstanding" rather than "not signed in as anyone".
 */
export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const userId = user?.id ?? null;
  const unreadQuery = useUnreadCount(userId);
  const listQuery = useNotifications(userId, { limit: 20 });
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead(userId);

  if (userId == null) return null;

  const unread = unreadQuery.data ?? 0;
  const items = listQuery.data || [];

  const openItem = (item) => {
    if (!item.readAt) markRead.mutate(item.id);
    setAnchorEl(null);
    if (item.link) navigate(item.link);
  };

  return (
    <>
      <Tooltip title={unread > 0 ? `${unread} unread notification(s)` : 'Notifications'}>
        <IconButton
          size="small"
          aria-label="Notifications"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{ color: 'text.secondary' }}
        >
          <Badge badgeContent={unread} color="error" max={99}>
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 19 }} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { width: 380, maxHeight: 460 } } }}
      >
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.25 }}
        >
          <Typography variant="subtitle2">Notifications</Typography>
          {unread > 0 ? (
            <Button size="small" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending}>
              Mark all read
            </Button>
          ) : null}
        </Stack>
        <Divider />

        {items.length === 0 ? (
          <Box sx={{ px: 2, py: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Nothing outstanding. Release-criteria reminders appear here as they fall due.
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding>
            {items.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => openItem(item)}
                sx={{ alignItems: 'flex-start', bgcolor: item.readAt ? undefined : 'action.hover' }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={item.readAt ? 400 : 600}>
                      {item.escalation ? 'FYI · ' : ''}
                      {item.title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {item.body}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {formatDateTime(item.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}
