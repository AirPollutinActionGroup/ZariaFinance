import BusinessIcon from '@mui/icons-material/Business';
import { OrganisationRegisterListPage } from './pages/OrganisationRegisterListPage.jsx';
import { OrganisationRegistrationCreatePage } from './pages/OrganisationRegistrationCreatePage.jsx';
import { OrganisationRegisterDetailPage } from './pages/OrganisationRegisterDetailPage.jsx';
import { MODULE_ID } from './constants.js';

/**
 * Organisation Register — Core Layer Module.
 * Plugs into Zariya's Open/Closed module registry system.
 */
export const organisationRegisterModule = {
  id: MODULE_ID,
  title: 'Organisation Register',
  navSection: 'CORE LAYERS',
  navItems: [
    { label: 'Organisation Register', path: '/organisation-register', icon: BusinessIcon },
  ],
  routes: [
    { path: '/organisation-register', element: <OrganisationRegisterListPage /> },
    { path: '/organisation-register/new', element: <OrganisationRegistrationCreatePage /> },
    { path: '/organisation-register/:id', element: <OrganisationRegisterDetailPage /> },
  ],
};
