import { employeeApi } from '../api/employeeApi.js';
import {
  DOCUMENT_FIELDS,
  fromEmployeeResponse,
  toCreateEmployeeRequest,
  toUpdateEmployeeRequest,
} from '../mappers/employeeMapper.js';

/**
 * Employee Master domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
/**
 * Brings the employee's stored documents in line with the form: a File is
 * uploaded (replacing any old one); null removes a stored one; a stored
 * document left as is stays untouched.
 */
async function syncDocuments(employee, formValues) {
  for (const { field, type, label } of DOCUMENT_FIELDS) {
    const value = formValues[field];
    const stored = employee.documents.some((d) => d.type === type);
    try {
      if (value instanceof File) await employeeApi.uploadDocument(employee.id, type, value);
      else if (value == null && stored) await employeeApi.deleteDocument(employee.id, type);
    } catch (error) {
      error.message = `${label}: ${error.message}`;
      error.savedEmployee = employee;
      throw error;
    }
  }
}

export const employeeService = {
  async listEmployees(search) {
    const dtos = await employeeApi.list(search);
    return dtos.map(fromEmployeeResponse);
  },

  async getEmployee(id) {
    return fromEmployeeResponse(await employeeApi.getById(id));
  },

  /**
   * Creates the employee, then uploads the chosen PAN / Aadhaar files. If an
   * upload fails the employee is already saved, so the error carries
   * `savedEmployee` — the caller should move to the edit page, not resubmit.
   */
  async createEmployee(formValues) {
    const created = fromEmployeeResponse(await employeeApi.create(toCreateEmployeeRequest(formValues)));
    await syncDocuments(created, formValues);
    return created;
  },

  /** Updates the employee, then uploads new files and removes the ones taken off the form. */
  async updateEmployee(id, formValues) {
    const updated = fromEmployeeResponse(await employeeApi.update(id, toUpdateEmployeeRequest(formValues)));
    await syncDocuments(updated, formValues);
    return updated;
  },

  async updateEmployeeStatus(id, status) {
    await employeeApi.updateStatus(id, status);
  },

  async getEmployeeUpdateLogs(id) {
    return employeeApi.getUpdateLogs(id);
  },
};
