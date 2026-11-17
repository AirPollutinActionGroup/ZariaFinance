/**
 * Funding Agreements — the unified Fund Profile + Grant Agreement module.
 *
 * Frontend-only: it reads and writes through the existing donor-management
 * services (fund profiles, grants). Its routes and nav entry are registered by
 * the Donor Management module (features/donor-management/index.jsx), so it
 * shares that module's id for permissions.
 */
export { MODULE_ID } from '../donor-management/constants.js';

/** Short class names for chips ("A · Restricted"); they follow the backend FundClass labels. */
export const CLASS_NAME = Object.freeze({ A: 'Restricted', B: 'Unrestricted w/ explanation', C: 'Fully unrestricted' });
