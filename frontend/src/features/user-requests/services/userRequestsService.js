import { userRequestsApi } from '../api/userRequestsApi.js';
import { fromUserRequestResponse } from '../mappers/userRequestMapper.js';

/**
 * User Requests domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
export const userRequestsService = {
  async listRequests() {
    const dtos = await userRequestsApi.list();
    return dtos.map(fromUserRequestResponse);
  },

  async getRequest(id) {
    return fromUserRequestResponse(await userRequestsApi.getById(id));
  },

  async approveRequest(id) {
    return fromUserRequestResponse(await userRequestsApi.approve(id));
  },

  async rejectRequest(id) {
    return fromUserRequestResponse(await userRequestsApi.reject(id));
  },
};
