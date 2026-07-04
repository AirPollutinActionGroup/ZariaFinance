import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import { DonorsListPage } from './pages/DonorsListPage.jsx';
import { DonorCreatePage } from './pages/DonorCreatePage.jsx';
import { DonorDetailPage } from './pages/DonorDetailPage.jsx';
import { DonorEditPage } from './pages/DonorEditPage.jsx';
import { GrantsListPage } from './pages/GrantsListPage.jsx';
import { GrantCreatePage } from './pages/GrantCreatePage.jsx';
import { GrantDetailPage } from './pages/GrantDetailPage.jsx';
import { MODULE_ID } from './constants.js';

/**
 * Donor Management module definition — the only file the platform needs
 * to know about this feature (registered in app/modules.js).
 */
export const donorManagementModule = {
  id: MODULE_ID,
  title: 'Donor Management',
  navSection: 'CORE LAYERS',
  navItems: [
    { label: 'Donors', path: '/donors', icon: VolunteerActivismOutlinedIcon },
    { label: 'Grants', path: '/grants', icon: HandshakeOutlinedIcon },
  ],
  routes: [
    { path: '/donors', element: <DonorsListPage /> },
    { path: '/donors/new', element: <DonorCreatePage /> },
    { path: '/donors/:id', element: <DonorDetailPage /> },
    { path: '/donors/:id/edit', element: <DonorEditPage /> },
    { path: '/grants', element: <GrantsListPage /> },
    { path: '/grants/new', element: <GrantCreatePage /> },
    { path: '/grants/:id', element: <GrantDetailPage /> },
  ],
};
