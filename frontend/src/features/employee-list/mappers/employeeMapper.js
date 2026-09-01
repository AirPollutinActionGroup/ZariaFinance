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

/** Form values → CreateEmployeeRequest. */
export function toCreateEmployeeRequest(values) {
  const isProject = values.bucket === 'Project';

  return {
    empId: values.empId.trim(),
    name: values.name.trim(),
    departmentId: values.departmentId,
    designationId: values.designationId,
    bucket: values.bucket,
    primaryProgrammeIds: isProject ? values.primaryProgrammeIds : [],
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
  };
}
