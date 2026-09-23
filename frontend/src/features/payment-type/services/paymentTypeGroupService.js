import { paymentTypeGroupApi } from '../api/paymentTypeGroupApi.js';
import { fromPaymentTypeGroupResponse, toCreatePaymentTypeGroupRequest } from '../mappers/paymentTypeGroupMapper.js';

/**
 * Payment Type Group domain service. All business behaviour lives here;
 * hooks and components call the service, never the repository directly.
 */
export const paymentTypeGroupService = {
  async listGroups(search) {
    const dtos = await paymentTypeGroupApi.list(search);
    return dtos.map(fromPaymentTypeGroupResponse);
  },

  async createGroup(formValues) {
    return fromPaymentTypeGroupResponse(
      await paymentTypeGroupApi.create(toCreatePaymentTypeGroupRequest(formValues)),
    );
  },

  async activateGroup(id) {
    await paymentTypeGroupApi.activate(id);
  },

  async deactivateGroup(id) {
    await paymentTypeGroupApi.deactivate(id);
  },
};
