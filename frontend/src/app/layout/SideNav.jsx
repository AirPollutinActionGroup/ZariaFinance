import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/auth/index.js';
import { canViewModule } from '../../core/permissions/index.js';
import { getNavSections } from '../../core/modules/index.js';
import { accent, graphite, layout } from '../../theme/tokens.js';
import { BrandMark } from './BrandMark.jsx';

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
          backgroundColor: graphite[950],
          color: accent.silver,
          borderRight: `1px solid ${accent.hairline}`,
        },
      }}
    >
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <BrandMark />
      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1, pb: 2 }}>
        {sections.map((section) => (
          <Box key={section.label} sx={{ mt: 1.5 }}>
            {section.label ? (
              <Typography
                variant="overline"
                sx={{ px: 2.5, color: graphite[500], display: 'block', mb: 0.5 }}
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
                      mx: 1.25,
                      mb: 0.25,
                      borderRadius: 2,
                      color: accent.silver,
                      '&.Mui-selected': {
                        background: accent.gradient,
                        color: accent.platinum,
                        border: `1px solid ${accent.hairline}`,
                        '&:hover': { background: accent.gradientHover },
                      },
                      '&:hover': { backgroundColor: graphite[900] },
                    }}
                  >
                    {Icon ? (
                      <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                    ) : null}
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: selected ? 600 : 500 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 2.5, py: 2, borderTop: `1px solid ${accent.hairline}` }}>
        <Typography sx={{ color: graphite[500], fontSize: 11 }}>v0.1 · Review Draft</Typography>
        <Typography sx={{ color: graphite[500], fontSize: 11 }}>A-PAG · TCF</Typography>
      </Box>
    </Drawer>
  );
}
