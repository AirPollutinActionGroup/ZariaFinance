package com.ngo.finance.masters.department.service;

import com.ngo.finance.masters.department.dto.request.CreateDepartmentRequest;
import com.ngo.finance.masters.department.dto.request.UpdateDepartmentRequest;
import com.ngo.finance.masters.department.dto.response.DepartmentResponse;
import java.util.List;

/**
 * Service interface for Department operations
 */
public interface DepartmentService {

    DepartmentResponse createDepartment(CreateDepartmentRequest request);

    DepartmentResponse getDepartmentById(Long id);

    List<DepartmentResponse> getAllDepartments();

    List<DepartmentResponse> searchDepartments(String searchTerm);

    DepartmentResponse updateDepartment(Long id, UpdateDepartmentRequest request);

    void activateDepartment(Long id);

    void deactivateDepartment(Long id);
}
