import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { DonationsListPage } from './pages/DonationsListPage.jsx';
import { DonationCreatePage } from './pages/DonationCreatePage.jsx';
import { DonationDetailPage } from './pages/DonationDetailPage.jsx';
import { MODULE_ID } from './constants.js';

/**
 * Donation Management module definition — the only file the platform needs
 * to know about this feature (registered in app/modules.js).
 *
 * The "Reports" and "Role directory" nav entries are rendered here (rather
 * than in donor-management) purely to control their position in the sidebar
 * rail (00/01/02/03…); the /reports and /role-directory routes themselves
 * still live in donor-management, which permission treats identically to
 * donation-management for every role today.
 */
export const donationManagementModule = {
  id: MODULE_ID,
  title: 'Donation Management',
  navSection: 'CORE LAYERS',
  navItems: [
    { label: 'Donations', path: '/donations', icon: VolunteerActivismOutlinedIcon },
    { label: 'Reports', path: '/reports', icon: AssessmentOutlinedIcon },
    { label: 'Role directory', path: '/role-directory', icon: GroupsOutlinedIcon },
  ],
  routes: [
    { path: '/donations', element: <DonationsListPage /> },
    { path: '/donations/new', element: <DonationCreatePage /> },
    { path: '/donations/:id', element: <DonationDetailPage /> },
  ],
};
