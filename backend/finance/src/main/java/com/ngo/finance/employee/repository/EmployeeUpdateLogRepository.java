package com.ngo.finance.employee.repository;

import com.ngo.finance.employee.entity.EmployeeUpdateLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeUpdateLogRepository extends JpaRepository<EmployeeUpdateLog, Long> {

    List<EmployeeUpdateLog> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}
