import { donorTypeApi } from '../api/donorTypeApi.js';

/**
 * Service for the Donor Type master lookup used on the donor form.
 * Returns active donor types in full (id, name, and the Fund Source
 * Domicile / Contribution Type values each one allows) so the form can both
 * populate the dropdown and constrain the Fund Source Domicile field once a
 * donor type is chosen. Inactive types stay hidden from new donor creation
 * but remain intact on existing donor records.
 */
export const donorTypeService = {
  async listActiveDonorTypes() {
    const list = await donorTypeApi.list();
    return list
      .filter((donorType) => donorType.status === 'ACTIVE')
      .map((donorType) => ({
        id: donorType.id,
        name: donorType.name,
        allowedFundSourceDomiciles: donorType.allowedFundSourceDomiciles || [],
        allowedContributionTypes: donorType.allowedContributionTypes || [],
      }));
  },
};
