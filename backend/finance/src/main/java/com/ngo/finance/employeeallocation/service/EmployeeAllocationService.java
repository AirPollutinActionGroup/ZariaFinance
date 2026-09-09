package com.ngo.finance.employeeallocation.service;

import com.ngo.finance.employeeallocation.dto.request.CreateEmployeeAllocationRequest;
import com.ngo.finance.employeeallocation.dto.response.EmployeeAllocationResponse;
import java.util.List;

public interface EmployeeAllocationService {

    List<EmployeeAllocationResponse> getAllAllocations();

    EmployeeAllocationResponse createAllocation(CreateEmployeeAllocationRequest request);

    void deleteAllocation(Long id);
}
