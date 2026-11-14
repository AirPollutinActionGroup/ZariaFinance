package com.ngo.finance.employeeallocation.service;

import com.ngo.finance.employeeallocation.dto.request.CreateEmployeeAllocationRequest;
import com.ngo.finance.employeeallocation.dto.request.EndEmployeeAllocationRequest;
import com.ngo.finance.employeeallocation.dto.response.EmployeeAllocationLogResponse;
import com.ngo.finance.employeeallocation.dto.response.EmployeeAllocationResponse;
import java.util.List;

public interface EmployeeAllocationService {

    List<EmployeeAllocationResponse> getAllAllocations();

    EmployeeAllocationResponse createAllocation(CreateEmployeeAllocationRequest request);

    /** Deletes the allocation; the removal is kept in the employee's allocation history. */
    void deleteAllocation(Long id, String note);

    /** Sets the allocation's end date (today when none is given); it stops counting after it. */
    EmployeeAllocationResponse endAllocation(Long id, EndEmployeeAllocationRequest request);

    /** Every CREATED / ENDED / REMOVED event for the employee, newest first. */
    List<EmployeeAllocationLogResponse> getHistory(Long employeeId);
}
