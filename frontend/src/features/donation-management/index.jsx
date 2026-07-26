import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import { DonationsListPage } from './pages/DonationsListPage.jsx';
import { DonationCreatePage } from './pages/DonationCreatePage.jsx';
import { DonationDetailPage } from './pages/DonationDetailPage.jsx';
import { MODULE_ID } from './constants.js';

/**
 * Donation Management module definition — the only file the platform needs
 * to know about this feature (registered in app/modules.js).
 *
 * The "Reports" nav entry is rendered here (rather than in donor-management)
 * purely to control its position in the sidebar rail (00/01/02/03…); the
 * /reports route itself still lives in donor-management, which permission
 * treats identically to donation-management for every role today.
 */
export const donationManagementModule = {
  id: MODULE_ID,
  title: 'Donation Management',
  navSection: 'CORE LAYERS',
  navItems: [
    { label: 'Donations', path: '/donations', icon: VolunteerActivismOutlinedIcon },
    { label: 'Reports', path: '/reports', icon: AssessmentOutlinedIcon },
  ],
  routes: [
    { path: '/donations', element: <DonationsListPage /> },
    { path: '/donations/new', element: <DonationCreatePage /> },
    { path: '/donations/:id', element: <DonationDetailPage /> },
  ],
};
