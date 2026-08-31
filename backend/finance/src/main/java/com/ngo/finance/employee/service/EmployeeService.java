package com.ngo.finance.employee.service;

import com.ngo.finance.employee.dto.request.CreateEmployeeRequest;
import com.ngo.finance.employee.dto.response.EmployeeResponse;
import java.util.List;

public interface EmployeeService {
    EmployeeResponse createEmployee(CreateEmployeeRequest request);

    EmployeeResponse getEmployeeById(Long id);

    List<EmployeeResponse> getAllEmployees();

    List<EmployeeResponse> searchEmployees(String searchTerm);

    void activateEmployee(Long id);

    void deactivateEmployee(Long id);
}
