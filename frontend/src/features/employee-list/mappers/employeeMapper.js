/**
 * employeeMapper — translates between backend DTOs (EmployeeResponse,
 * CreateEmployeeRequest) and the frontend form/view model. Backend field
 * names are preserved verbatim, status included — it's a lifecycle string
 * (see EMPLOYEE_STATUSES), not a boolean, so no re-casing is needed.
 */

/** EmployeeResponse → view model. */
export function fromEmployeeResponse(dto) {
  return { ...dto };
}

/** EmployeeResponse → edit form default values. */
export function toEditFormValues(dto) {
  return {
    empId: dto.empId,
    name: dto.name,
    departmentId: dto.departmentId,
    designationId: dto.designationId,
    bucket: dto.bucket,
    stateIds: dto.stateIds || [],
    cityIds: dto.cityIds || [],
    joiningDate: dto.joiningDate || '',
    exitDate: dto.exitDate || '',
    annualCtc: dto.annualCtc != null ? String(dto.annualCtc) : '',
    employmentType: dto.employmentType,
    pf: dto.pf,
    esi: dto.esi,
    gratuity: dto.gratuity,
    status: dto.status,
    remark: dto.remark || '',
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
    stateIds: values.stateIds,
    cityIds: values.cityIds,
    joiningDate: values.joiningDate,
    exitDate: values.exitDate || null,
    annualCtc: Number(String(values.annualCtc).replace(/,/g, '')),
    employmentType: values.employmentType,
    pf: values.pf,
    esi: values.esi,
    gratuity: values.gratuity,
    status: values.status,
    remark: values.remark?.trim() || null,
  };
}

/** Form values → UpdateEmployeeRequest — identical shape to create, so it's the same builder. */
export const toUpdateEmployeeRequest = toCreateEmployeeRequest;
