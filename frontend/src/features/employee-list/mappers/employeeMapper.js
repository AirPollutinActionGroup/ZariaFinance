import { employeeApi } from '../api/employeeApi.js';
import { employeeCreateDefaults } from '../validation/employeeCreateSchema.js';

/** Form field ↔ backend document type. */
export const DOCUMENT_FIELDS = [
  { field: 'panCardFile', type: 'PAN_CARD', label: 'PAN Card' },
  { field: 'aadhaarCardFile', type: 'AADHAAR_CARD', label: 'Aadhaar Card' },
];

const blankToNull = (value) => (value == null || String(value).trim() === '' ? null : String(value).trim());

/** An uploaded document's metadata, plus the URL it can be viewed at. */
function toStoredDocument(employeeId, doc) {
  return { ...doc, stored: true, url: employeeApi.documentUrl(employeeId, doc.type) };
}

/**
 * employeeMapper — translates between backend DTOs (EmployeeResponse,
 * CreateEmployeeRequest) and the frontend form/view model. Backend field
 * names are preserved verbatim, status included — it's a lifecycle string
 * (see EMPLOYEE_STATUSES), not a boolean, so no re-casing is needed.
 */

/** EmployeeResponse → view model. */
export function fromEmployeeResponse(dto) {
  return { ...dto, documents: (dto.documents || []).map((doc) => toStoredDocument(dto.id, doc)) };
}

/** EmployeeResponse → edit form default values. */
export function toEditFormValues(dto) {
  return {
    ...employeeCreateDefaults,
    empId: dto.empId,
    name: dto.name,
    departmentId: dto.departmentId,
    designationId: dto.designationId,
    bucket: dto.bucket,
    // The backend keeps lists; the form picks one state and one city.
    stateId: dto.stateIds?.[0] ?? '',
    cityId: dto.cityIds?.[0] ?? '',
    joiningDate: dto.joiningDate || '',
    exitDate: dto.exitDate || '',
    annualCtc: dto.annualCtc != null ? String(dto.annualCtc) : '',
    employmentType: dto.employmentType,
    pf: dto.pf,
    esi: dto.esi,
    gratuity: dto.gratuity,
    status: dto.status,
    remark: dto.remark || '',
    panNumber: dto.panNumber || '',
    accountHolderName: dto.accountHolderName || '',
    bankName: dto.bankName || '',
    accountType: dto.accountType || '',
    accountNumber: dto.accountNumber || '',
    ifscCode: dto.ifscCode || '',
    branchName: dto.branchName || '',
    // Already-uploaded files show as stored documents; a File replaces one, null removes it.
    ...Object.fromEntries(
      DOCUMENT_FIELDS.map(({ field, type }) => {
        const doc = (dto.documents || []).find((d) => d.type === type);
        return [field, doc ? toStoredDocument(dto.id, doc) : null];
      }),
    ),
  };
}

/** Form values → CreateEmployeeRequest. */
export function toCreateEmployeeRequest(values) {
  return {
    empId: values.empId.trim(),
    name: values.name.trim(),
    departmentId: values.departmentId,
    designationId: values.designationId,
    bucket: values.bucket,
    stateIds: values.stateId !== '' && values.stateId != null ? [values.stateId] : [],
    cityIds: values.cityId !== '' && values.cityId != null ? [values.cityId] : [],
    joiningDate: values.joiningDate,
    exitDate: values.exitDate || null,
    annualCtc: Number(String(values.annualCtc).replace(/,/g, '')),
    employmentType: values.employmentType,
    pf: values.pf,
    esi: values.esi,
    gratuity: values.gratuity,
    status: values.status,
    remark: values.remark?.trim() || null,
    panNumber: blankToNull(values.panNumber)?.toUpperCase() ?? null,
    accountHolderName: blankToNull(values.accountHolderName),
    bankName: blankToNull(values.bankName),
    accountType: blankToNull(values.accountType),
    accountNumber: blankToNull(values.accountNumber),
    ifscCode: blankToNull(values.ifscCode)?.toUpperCase() ?? null,
    branchName: blankToNull(values.branchName),
  };
}

/** Form values → UpdateEmployeeRequest — identical shape to create, so it's the same builder. */
export const toUpdateEmployeeRequest = toCreateEmployeeRequest;
