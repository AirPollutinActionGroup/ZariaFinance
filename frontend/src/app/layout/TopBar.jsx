import { Avatar, Box, Button, Chip, Stack, Typography } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/index.js';
import { ROLES } from '../../core/permissions/index.js';

const ROLE_LABELS = {
  [ROLES.CEO]: 'CEO',
  [ROLES.FINANCE_OFFICER]: 'Accounts / Finance Officer',
  [ROLES.FUNDRAISING_LEAD]: 'Fund Raising Lead',
};

/** Top application bar: identity, review-mode flag and sign-out. */
export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = (user?.name || '?')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const roleLabel = ROLE_LABELS[user?.role] || user?.role || 'Member';

  return (
    <Box
      component="header"
      sx={{
        height: 64,
        px: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 3,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {user?.mode === 'review' ? (
        <Chip
          size="small"
          label="Review mode — backend sign-in pending"
          variant="outlined"
          color="secondary"
          sx={{ fontWeight: 600 }}
        />
      ) : null}

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            fontSize: 13,
            fontWeight: 600,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {initials}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {roleLabel}
          </Typography>
        </Box>
      </Stack>

      <Button
        variant="outlined"
        size="small"
        color="inherit"
        startIcon={<LogoutRoundedIcon sx={{ fontSize: 16 }} />}
        onClick={handleLogout}
      >
        Sign out
      </Button>
    </Box>
  );
}
