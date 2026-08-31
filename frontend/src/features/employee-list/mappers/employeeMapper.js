/**
 * employeeMapper — translates between backend DTOs (EmployeeResponse,
 * CreateEmployeeRequest) and the frontend form/view model. Backend field
 * names are preserved verbatim; status is already 'Active'/'Inactive' on
 * the wire, so no re-casing is needed on the way in.
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
    department: values.department,
    designation: values.designation.trim(),
    bucket: values.bucket,
    primaryProgramme: isProject ? values.primaryProgramme : null,
    state: values.state,
    annualCtc: Number(String(values.annualCtc).replace(/,/g, '')),
    employmentType: values.employmentType,
    pf: values.pf,
    esi: values.esi,
    gratuity: values.gratuity,
    status: values.status !== 'Inactive',
  };
}
