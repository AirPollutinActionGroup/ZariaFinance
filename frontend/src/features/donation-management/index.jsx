import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import { DonationsListPage } from './pages/DonationsListPage.jsx';
import { DonationCreatePage } from './pages/DonationCreatePage.jsx';
import { DonationDetailPage } from './pages/DonationDetailPage.jsx';
import { MODULE_ID } from './constants.js';

/**
 * Donation Management module definition — the only file the platform needs
 * to know about this feature (registered in app/modules.js).
 */
export const donationManagementModule = {
  id: MODULE_ID,
  title: 'Donation Management',
  navSection: 'CORE LAYERS',
  navItems: [{ label: 'Donations', path: '/donations', icon: VolunteerActivismOutlinedIcon }],
  routes: [
    { path: '/donations', element: <DonationsListPage /> },
    { path: '/donations/new', element: <DonationCreatePage /> },
    { path: '/donations/:id', element: <DonationDetailPage /> },
  ],
};
