import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { DonorsListPage } from './pages/DonorsListPage.jsx';
import { DonorCreatePage } from './pages/DonorCreatePage.jsx';
import { DonorDetailPage } from './pages/DonorDetailPage.jsx';
import { DonorEditPage } from './pages/DonorEditPage.jsx';
import { GrantsListPage } from './pages/GrantsListPage.jsx';
import { GrantCreatePage } from './pages/GrantCreatePage.jsx';
import { GrantDetailPage } from './pages/GrantDetailPage.jsx';
import { GrantEditPage } from './pages/GrantEditPage.jsx';
import { GrantDisbursementPage } from './pages/GrantDisbursementPage.jsx';
import { FundProfileFormPage } from './pages/FundProfileFormPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { ProgrammesListPage } from './pages/ProgrammesListPage.jsx';
import { ProgrammeCreatePage } from './pages/ProgrammeCreatePage.jsx';
import { ProgrammeDetailPage } from './pages/ProgrammeDetailPage.jsx';
import { DonationsListPage } from '../donation-management/pages/DonationsListPage.jsx';
import { DonationCreatePage } from '../donation-management/pages/DonationCreatePage.jsx';
import { DonationDetailPage } from '../donation-management/pages/DonationDetailPage.jsx';
import { UserRequestsListPage } from '../user-requests/pages/UserRequestsListPage.jsx';
import { UserRequestDetailPage } from '../user-requests/pages/UserRequestDetailPage.jsx';
import { OrganisationRegisterListPage } from '../organisation-register/pages/OrganisationRegisterListPage.jsx';
import { OrganisationRegistrationCreatePage } from '../organisation-register/pages/OrganisationRegistrationCreatePage.jsx';
import { OrganisationRegisterDetailPage } from '../organisation-register/pages/OrganisationRegisterDetailPage.jsx';
import { RoleDirectoryListPage } from '../role-directory/pages/RoleDirectoryListPage.jsx';
import { RoleCreatePage } from '../role-directory/pages/RoleCreatePage.jsx';
import BusinessIcon from '@mui/icons-material/Business';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import { MODULE_ID } from './constants.js';
import { EmployeeListPage } from '../employee-list/pages/EmployeeListPage.jsx';
import { EmployeeCreatePage } from '../employee-list/pages/EmployeeCreatePage.jsx';
import { EmployeeDetailPage } from '../employee-list/pages/EmployeeDetailPage.jsx';
import { MasterPage } from '../masters/pages/MasterPage.jsx';

/**
 * Donor Management module definition — registered in app/modules.js.
 */
export const donorManagementModule = {
  id: MODULE_ID,
  title: 'Donor Management',
  navSection: 'CORE LAYERS',
  navItems: [
    { label: 'Donors Registry', path: '/donors', icon: VolunteerActivismOutlinedIcon },
    { label: 'Grants Agreements', path: '/grants', icon: HandshakeOutlinedIcon },
    { label: 'Donations', path: '/donations', icon: VolunteerActivismOutlinedIcon },
    { label: 'Programmes', path: '/programmes', icon: CategoryOutlinedIcon },
    //{ label: 'User Requests', path: '/user-requests', icon: PersonAddOutlinedIcon },
    //{ label: 'organization Register', path: '/organisation-register', icon: BusinessIcon },
    //{ label: 'Role Directory', path: '/role-directory', icon: GroupsOutlinedIcon },
    { label: 'Employee List', path: '/employee-list', icon: BadgeOutlinedIcon },
    { label: 'Master', path: '/masters', icon: StorageOutlinedIcon },
  ],
  routes: [
    { path: '/donors', element: <DonorsListPage /> },
    { path: '/donors/new', element: <DonorCreatePage /> },
    { path: '/donors/:id', element: <DonorDetailPage /> },
    { path: '/donors/:id/edit', element: <DonorEditPage /> },
    { path: '/donors/:donorId/fund-profiles/new', element: <FundProfileFormPage /> },
    { path: '/fund-profiles/:id/edit', element: <FundProfileFormPage /> },
    { path: '/grants', element: <GrantsListPage /> },
    { path: '/grants/new', element: <GrantCreatePage /> },
    { path: '/grants/:id', element: <GrantDetailPage /> },
    { path: '/grants/:id/edit', element: <GrantEditPage /> },
    { path: '/grants/:id/disbursement', element: <GrantDisbursementPage /> },
    { path: '/donations', element: <DonationsListPage /> },
    { path: '/donations/new', element: <DonationCreatePage /> },
    { path: '/donations/:id', element: <DonationDetailPage /> },
    { path: '/programmes', element: <ProgrammesListPage /> },
    { path: '/programmes/new', element: <ProgrammeCreatePage /> },
    { path: '/programmes/:id', element: <ProgrammeDetailPage /> },
    { path: '/reports', element: <ReportsPage /> },
    { path: '/user-requests', element: <UserRequestsListPage /> },
    { path: '/user-requests/:id', element: <UserRequestDetailPage /> },
    { path: '/organisation-register', element: <OrganisationRegisterListPage /> },
    { path: '/organisation-register/new', element: <OrganisationRegistrationCreatePage /> },
    { path: '/organisation-register/:id', element: <OrganisationRegisterDetailPage /> },
    { path: '/role-directory', element: <RoleDirectoryListPage /> },
    { path: '/role-directory/new', element: <RoleCreatePage /> },
    { path: '/employee-list', element: <EmployeeListPage /> },
    { path: '/employee-list/new', element: <EmployeeCreatePage /> },
    { path: '/employee-list/:id', element: <EmployeeDetailPage /> },
    { path: '/masters', element: <MasterPage /> },
    { path: '/masters/departments', element: <MasterPage /> },
    { path: '/masters/designations', element: <MasterPage /> },
  ],
};
