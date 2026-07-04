import {
  AppBar,
  Avatar,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/index.js';
import { ROLES } from '../../core/permissions/index.js';
import { accent, graphite, layout } from '../../theme/tokens.js';

const ROLE_LABELS = {
  [ROLES.CEO]: 'CEO',
  [ROLES.FINANCE_OFFICER]: 'Accounts / Finance Officer',
  [ROLES.FUNDRAISING_LEAD]: 'Fund Raising Lead',
};

/** Top application bar: identity, review-mode flag and sign-out. */
export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const initials = (user?.name || '?')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: `1px solid ${graphite[200]}`,
        height: layout.topbarHeight,
        justifyContent: 'center',
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Box sx={{ flex: 1 }} />
        {user?.mode === 'review' ? (
          <Chip
            size="small"
            label="Review mode — backend sign-in pending"
            sx={{ background: accent.gradient, color: accent.platinum }}
          />
        ) : null}
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ cursor: 'pointer' }}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          role="button"
          aria-label="Account menu"
        >
          <Avatar sx={{ width: 34, height: 34, background: accent.gradient, fontSize: 13 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
              {ROLE_LABELS[user?.role] || user?.role}
            </Typography>
          </Box>
        </Stack>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Sign out
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
