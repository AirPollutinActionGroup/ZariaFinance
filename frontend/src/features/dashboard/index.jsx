import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import { DashboardPage } from './pages/DashboardPage.jsx';

/** Dashboard module definition. */
export const dashboardModule = {
  id: 'dashboard',
  title: 'Dashboard',
  navSection: '',
  navItems: [{ label: 'Dashboard', path: '/dashboard', icon: GridViewOutlinedIcon }],
  routes: [{ path: '/dashboard', element: <DashboardPage /> }],
};
