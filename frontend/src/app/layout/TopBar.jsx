import { Avatar, Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/index.js';
import { ROLES } from '../../core/permissions/index.js';
import { useColorMode } from '../../theme/ColorMode.jsx';

const ROLE_LABELS = {
  [ROLES.CEO]: 'CEO',
  [ROLES.FINANCE_OFFICER]: 'Accounts / Finance Officer',
  [ROLES.FUNDRAISING_LEAD]: 'Fund Raising Lead',
};

/** Short access descriptor shown under the role, mirroring the design preview. */
const ROLE_ACCESS = {
  [ROLES.CEO]: 'full access · approver',
  [ROLES.FINANCE_OFFICER]: 'full edit · approver',
  [ROLES.FUNDRAISING_LEAD]: 'edit · submit',
};

/** Top application bar: identity, review-mode flag, theme toggle and sign-out. */
export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useColorMode();

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
  const roleAccess = ROLE_ACCESS[user?.role] || null;

  return (
    <Box
      component="header"
      sx={{
        height: 56,
        px: { xs: 2, md: 3.25 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1.75,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 6,
      }}
    >
      {user?.mode === 'review' ? (
        <Chip
          size="small"
          label="Review mode — backend sign-in pending"
          variant="outlined"
          color="warning"
          sx={{ mr: 'auto', fontWeight: 600 }}
        />
      ) : null}

      <Tooltip title={mode === 'dark' ? 'Switch to light' : 'Switch to dark'}>
        <IconButton
          onClick={toggleColorMode}
          size="small"
          aria-label="Toggle colour theme"
          sx={{ color: 'text.secondary' }}
        >
          {mode === 'dark' ? (
            <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
          ) : (
            <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>
      </Tooltip>

      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        <Avatar
          sx={{
            width: 30,
            height: 30,
            fontSize: 11,
            fontWeight: 700,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
            {roleLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" lineHeight={1.2}>
            {roleAccess || user?.name}
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
