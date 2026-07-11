import { Box, Drawer, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/auth/index.js';
import { canViewModule } from '../../core/permissions/index.js';
import { getNavSections } from '../../core/modules/index.js';
import { layout } from '../../theme/tokens.js';

/**
 * Application sidebar — a quiet "rail" in the Zariya design language: serif
 * wordmark, uppercase section labels, numbered nav entries, an inked active
 * state. Content is derived entirely from the module registry filtered by the
 * current user's permissions — the shell knows nothing about individual
 * business domains.
 */
export function SideNav() {
  const { user } = useAuth();
  const location = useLocation();
  const sections = getNavSections(user, canViewModule);

  // Running index across every visible item → the 00 / 01 / 02 rail numbering.
  let itemIndex = 0;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: layout.sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: layout.sidebarWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          color: 'text.secondary',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ px: 2.25, pt: 2.5, pb: 1.25 }}>
        <Typography
          variant="h5"
          component="p"
          sx={{ letterSpacing: '.01em', color: 'text.primary', fontSize: 22 }}
        >
          Zariya
        </Typography>
        <Typography
          sx={{
            color: 'text.secondary',
            fontSize: 10.5,
            letterSpacing: '.14em',
            textTransform: 'uppercase',
          }}
        >
          Donor Module · Master
        </Typography>
      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1, pb: 2, px: 1 }}>
        {sections.map((section) => (
          <Box key={section.label || 'main'} sx={{ mt: 1.5 }}>
            {section.label ? (
              <Typography
                variant="overline"
                sx={{ px: 1.5, pt: 1, pb: 0.5, display: 'block', fontSize: 9.5 }}
              >
                {section.label}
              </Typography>
            ) : null}
            <List disablePadding>
              {section.items.map((item) => {
                const selected =
                  location.pathname === item.path ||
                  location.pathname.startsWith(`${item.path}/`);
                const idx = String(itemIndex++).padStart(2, '0');
                return (
                  <ListItemButton
                    key={item.path}
                    component={NavLink}
                    to={item.path}
                    selected={selected}
                    sx={{
                      borderRadius: 2,
                      mb: '1px',
                      px: 1.5,
                      py: 0.9,
                      alignItems: 'baseline',
                      color: 'text.primary',
                      '&:hover': { bgcolor: 'action.hover' },
                      '&.Mui-selected': {
                        color: 'primary.contrastText',
                        backgroundColor: 'primary.main',
                        '&:hover': { backgroundColor: 'primary.main', opacity: 0.92 },
                        '& .rail-idx': { color: 'inherit', opacity: 0.6 },
                      },
                    }}
                  >
                    <Box
                      className="rail-idx"
                      sx={{
                        width: 20,
                        flex: 'none',
                        fontSize: 10,
                        color: 'text.secondary',
                      }}
                    >
                      {idx}
                    </Box>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: selected ? 600 : 500 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Box sx={{ px: 2.25, py: 1.75, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: 10.5 }}>Donor Module v2 · Preview</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 10.5 }}>A-PAG · TCF</Typography>
      </Box>
    </Drawer>
  );
}
