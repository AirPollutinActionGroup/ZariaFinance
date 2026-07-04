import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { layout } from '../../theme/tokens.js';
import { SideNav } from './SideNav.jsx';
import { TopBar } from './TopBar.jsx';

/** Authenticated application frame: sidebar + top bar + routed content. */
export function AppShell() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <SideNav />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar />
        <Box
          component="main"
          sx={{
            flex: 1,
            px: { xs: 2, md: 4 },
            py: 3,
            width: '100%',
            maxWidth: layout.contentMaxWidth,
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
