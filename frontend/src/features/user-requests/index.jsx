import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { UserRequestsListPage } from './pages/UserRequestsListPage.jsx';
import { UserRequestDetailPage } from './pages/UserRequestDetailPage.jsx';
import { MODULE_ID } from './constants.js';

/**
 * User Requests — Core Layer Module.
 * Plugs into Zariya's Open/Closed module registry system.
 */
export const userRequestsModule = {
  id: MODULE_ID,
  title: 'User Requests',
  navSection: 'CORE LAYERS',
  navItems: [
    { label: 'User Requests', path: '/user-requests', icon: PersonAddOutlinedIcon },
  ],
  routes: [
    { path: '/user-requests', element: <UserRequestsListPage /> },
    { path: '/user-requests/:id', element: <UserRequestDetailPage /> },
  ],
};
