import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/auth/index.js';
import { canViewModule } from '../../core/permissions/index.js';
import { getNavSections } from '../../core/modules/index.js';
import { layout } from '../../theme/tokens.js';

/**
 * Application sidebar. Content is derived entirely from the module registry
 * filtered by the current user's permissions — the shell knows nothing about
 * individual business domains.
 */
export function SideNav() {
  const { user } = useAuth();
  const location = useLocation();
  const sections = getNavSections(user, canViewModule);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: layout.sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: layout.sidebarWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.default',
          color: 'text.secondary',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" component="p" sx={{ letterSpacing: '0.02em', color: 'text.primary' }}>
          Zariya
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: '0.08em' }}>
          Budgeting · Trading · Reporting
        </Typography>
      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1, pb: 2, px: 2 }}>
        {sections.map((section) => (
          <Box key={section.label} sx={{ mt: 3 }}>
            {section.label ? (
              <Typography
                variant="overline"
                sx={{ px: 1.5, display: 'block', mb: 0.5 }}
              >
                {section.label}
              </Typography>
            ) : null}
            <List disablePadding>
              {section.items.map((item) => {
                const selected =
                  location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`);
                const Icon = item.icon;
                return (
                  <ListItemButton
                    key={item.path}
                    component={NavLink}
                    to={item.path}
                    selected={selected}
                    sx={{
                      borderRadius: 2,
                      mb: 0.25,
                      px: 1.5,
                      py: 0.9,
                      color: 'text.secondary',
                      '&:hover': { bgcolor: 'action.hover' },
                      '&.Mui-selected': {
                        color: 'text.primary',
                        backgroundColor: '#ECE9E2',
                        '& .MuiListItemIcon-root': { color: 'secondary.main' },
                        '&:hover': { backgroundColor: '#E2DFD7' },
                      },
                    }}
                  >
                    {Icon ? (
                      <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
                        <Icon sx={{ fontSize: 19 }} />
                      </ListItemIcon>
                    ) : null}
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: 11 }}>v0.1 · Review Draft</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 11 }}>A-PAG · TCF</Typography>
      </Box>
    </Drawer>
  );
}
