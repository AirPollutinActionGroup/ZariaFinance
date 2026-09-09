package com.ngo.finance.employeeallocation.repository;

import com.ngo.finance.employeeallocation.entity.EmployeeAllocation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeAllocationRepository extends JpaRepository<EmployeeAllocation, Long> {

    List<EmployeeAllocation> findByEmployeeId(Long employeeId);
}
