import { employeeApi } from '../api/employeeApi.js';
import {
  fromEmployeeResponse,
  toCreateEmployeeRequest,
  toUpdateEmployeeRequest,
} from '../mappers/employeeMapper.js';

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

  async updateEmployee(id, formValues) {
    return fromEmployeeResponse(await employeeApi.update(id, toUpdateEmployeeRequest(formValues)));
  },

  async updateEmployeeStatus(id, status) {
    await employeeApi.updateStatus(id, status);
  },

  async getEmployeeUpdateLogs(id) {
    return employeeApi.getUpdateLogs(id);
  },
};
