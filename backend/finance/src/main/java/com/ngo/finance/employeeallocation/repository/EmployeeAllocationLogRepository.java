package com.ngo.finance.employeeallocation.repository;

import com.ngo.finance.employeeallocation.entity.EmployeeAllocationLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeAllocationLogRepository extends JpaRepository<EmployeeAllocationLog, Long> {

    /** Newest first. */
    List<EmployeeAllocationLog> findByEmployeeIdOrderByCreatedAtDescIdDesc(Long employeeId);
}
