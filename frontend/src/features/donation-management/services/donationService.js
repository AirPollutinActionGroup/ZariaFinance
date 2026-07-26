import { donationApi } from '../api/donationApi.js';
import {
  fromDonationDetailResponse,
  fromDonationListResponse,
  toCreateDonationRequest,
} from '../mappers/donationMapper.js';

/** Donation domain service: gift-received orchestration. No lifecycle to manage — income is recognised on receipt. */
export const donationService = {
  async listDonations(filters) {
    const dtos = await donationApi.list(filters);
    return dtos.map(fromDonationListResponse);
  },

  async getDonation(id) {
    return fromDonationDetailResponse(await donationApi.getById(id));
  },

  async createDonation(formValues) {
    return fromDonationDetailResponse(await donationApi.create(toCreateDonationRequest(formValues)));
  },

  async updateDonation(id, formValues) {
    return fromDonationDetailResponse(await donationApi.update(id, toCreateDonationRequest(formValues)));
  },

  async updateGikIntendedUse(donationId, gikItemId, { intendedUse, reason }) {
    return fromDonationDetailResponse(
      await donationApi.updateGikIntendedUse(donationId, gikItemId, { intendedUse, reason }),
    );
  },

  async issueEightyGReceipt(id) {
    return fromDonationDetailResponse(await donationApi.issueEightyGReceipt(id));
  },

  async markTenBdFiling(id) {
    return fromDonationDetailResponse(await donationApi.markTenBdFiling(id));
  },
};
