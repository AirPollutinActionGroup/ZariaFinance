package com.ngo.finance.employee.service;

import com.ngo.finance.employee.dto.request.CreateEmployeeRequest;
import com.ngo.finance.employee.dto.request.UpdateEmployeeRequest;
import com.ngo.finance.employee.dto.response.EmployeeResponse;
import com.ngo.finance.employee.dto.response.EmployeeUpdateLogResponse;
import java.util.List;

public interface EmployeeService {
    EmployeeResponse createEmployee(CreateEmployeeRequest request);

    EmployeeResponse updateEmployee(Long id, UpdateEmployeeRequest request);

    EmployeeResponse getEmployeeById(Long id);

    List<EmployeeResponse> getAllEmployees();

    List<EmployeeResponse> searchEmployees(String searchTerm);

    void updateStatus(Long id, String status);

    List<EmployeeUpdateLogResponse> getUpdateLogs(Long id);
}
