import { organisationApi } from '../api/organisationApi.js';
import { fromOrganisationResponse, toCreateOrganisationRequest } from '../mappers/organisationMapper.js';

/**
 * Organisation Register domain service. All business behaviour lives here;
 * hooks and components call the service, never the repository directly.
 */
export const organisationService = {
  async listOrganisations(search) {
    const dtos = await organisationApi.list(search);
    return dtos.map(fromOrganisationResponse);
  },

  async getOrganisation(id) {
    return fromOrganisationResponse(await organisationApi.getById(id));
  },

  async createOrganisation(formValues) {
    return fromOrganisationResponse(await organisationApi.create(toCreateOrganisationRequest(formValues)));
  },

  /** Resolves true when shortName is not already registered. */
  async isShortNameAvailable(shortName) {
    const { exists } = await organisationApi.verifyShortName(shortName);
    return !exists;
  },

  async activateOrganisation(id) {
    await organisationApi.activate(id);
  },

  async deactivateOrganisation(id) {
    await organisationApi.deactivate(id);
  },
};
