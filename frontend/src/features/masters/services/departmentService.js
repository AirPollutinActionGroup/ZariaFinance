import { departmentApi } from '../api/departmentApi.js';
import { fromDepartmentResponse, toCreateDepartmentRequest } from '../mappers/departmentMapper.js';

/**
 * Department domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
export const departmentService = {
  async listDepartments(search) {
    const dtos = await departmentApi.list(search);
    return dtos.map(fromDepartmentResponse);
  },

  async createDepartment(formValues) {
    return fromDepartmentResponse(await departmentApi.create(toCreateDepartmentRequest(formValues)));
  },

  async activateDepartment(id) {
    await departmentApi.activate(id);
  },

  async deactivateDepartment(id) {
    await departmentApi.deactivate(id);
  },
};
