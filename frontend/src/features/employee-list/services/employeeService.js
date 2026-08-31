import { employeeApi } from '../api/employeeApi.js';
import { fromEmployeeResponse, toCreateEmployeeRequest } from '../mappers/employeeMapper.js';

/**
 * Employee Master domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
export const employeeService = {
  async listEmployees(search) {
    const dtos = await employeeApi.list(search);
    return dtos.map(fromEmployeeResponse);
  },

  async getEmployee(id) {
    return fromEmployeeResponse(await employeeApi.getById(id));
  },

  async createEmployee(formValues) {
    return fromEmployeeResponse(await employeeApi.create(toCreateEmployeeRequest(formValues)));
  },

  async activateEmployee(id) {
    await employeeApi.activate(id);
  },

  async deactivateEmployee(id) {
    await employeeApi.deactivate(id);
  },
};
