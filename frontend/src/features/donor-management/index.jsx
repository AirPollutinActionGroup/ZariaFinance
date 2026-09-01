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
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import { MODULE_ID } from './constants.js';
import { EmployeeListPage } from '../employee-list/pages/EmployeeListPage.jsx';
import { EmployeeCreatePage } from '../employee-list/pages/EmployeeCreatePage.jsx';
import { EmployeeDetailPage } from '../employee-list/pages/EmployeeDetailPage.jsx';
import { EmployeeEditPage } from '../employee-list/pages/EmployeeEditPage.jsx';
import { MasterPage } from '../masters/pages/MasterPage.jsx';
import { VendorListPage } from '../vendor-registration/pages/VendorListPage.jsx';
import { VendorCreatePage } from '../vendor-registration/pages/VendorCreatePage.jsx';
import { VendorDetailPage } from '../vendor-registration/pages/VendorDetailPage.jsx';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import { TransactionEntryPage } from '../transaction-entry/pages/TransactionEntryPage.jsx';
import { PaymentModesPage } from '../payment-mode/pages/PaymentModesPage.jsx';
import { PaymentTypesPage } from '../payment-type/pages/PaymentTypesPage.jsx';
import { BankDetailsPage } from '../bank-details/pages/BankDetailsPage.jsx';
import { NewTransactionPage } from '../new-transaction/pages/NewTransactionPage.jsx';
import { NewTransactionListPage } from '../new-transaction/pages/NewTransactionListPage.jsx';
import { NewTransactionDetailPage } from '../new-transaction/pages/NewTransactionDetailPage.jsx';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import { FinancialYearsPage } from '../financial-year/pages/FinancialYearsPage.jsx';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { InflowBudgetPage } from '../inflow-budget/pages/InflowBudgetPage.jsx';
import { InflowDetailPage } from '../inflow-budget/pages/InflowDetailPage.jsx';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import { OutflowBudgetPage } from '../outflow-budget/pages/OutflowBudgetPage.jsx';
import { OutflowDetailPage } from '../outflow-budget/pages/OutflowDetailPage.jsx';
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined';

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
    { label: 'Vendor Registration', path: '/vendor-registration', icon: StorefrontOutlinedIcon },
    { label: 'Payment Mode', path: '/payment-modes', icon: PaymentOutlinedIcon },
    { label: 'Bank Details', path: '/bank-details', icon: AccountBalanceOutlinedIcon },
    { label: 'Financial Year', path: '/financial-years', icon: CalendarMonthOutlinedIcon },

    { label: 'Payment Type', path: '/payment-types', icon: AccountTreeOutlinedIcon },
    { label: 'Transaction Entry', path: '/transaction-entry', icon: ReceiptLongOutlinedIcon },
    { label: 'Payment Window(Cr/Dr)', path: '/new-transaction', icon: ReceiptOutlinedIcon },
    { label: 'Inflow Budget', path: '/inflow-budget', icon: TrendingUpOutlinedIcon },
    { label: 'Outflow Budget', path: '/outflow-budget', icon: TrendingDownOutlinedIcon },
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
    { path: '/employee-list/:id/edit', element: <EmployeeEditPage /> },
    { path: '/masters', element: <MasterPage /> },
    { path: '/masters/departments', element: <MasterPage /> },
    { path: '/masters/designations', element: <MasterPage /> },
    { path: '/vendor-registration', element: <VendorListPage /> },
    { path: '/vendor-registration/new', element: <VendorCreatePage /> },
    { path: '/vendor-registration/:id', element: <VendorDetailPage /> },
    { path: '/transaction-entry', element: <TransactionEntryPage /> },
    { path: '/new-transaction', element: <NewTransactionListPage /> },
    { path: '/new-transaction/new', element: <NewTransactionPage /> },
    { path: '/new-transaction/:id', element: <NewTransactionDetailPage /> },
    { path: '/payment-modes', element: <PaymentModesPage /> },
    { path: '/payment-types', element: <PaymentTypesPage /> },
    { path: '/bank-details', element: <BankDetailsPage /> },
    { path: '/financial-years', element: <FinancialYearsPage /> },
    { path: '/inflow-budget', element: <InflowBudgetPage /> },
    { path: '/inflow-budget/:id', element: <InflowDetailPage /> },
    { path: '/outflow-budget', element: <OutflowBudgetPage /> },
    { path: '/outflow-budget/:id', element: <OutflowDetailPage /> },
  ],
};
