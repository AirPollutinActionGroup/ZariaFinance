package com.ngo.finance.employee.repository;

import com.ngo.finance.employee.entity.Employee;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    boolean existsByEmpId(String empId);

    @Query("SELECT e FROM Employee e WHERE e.name LIKE %:searchTerm% "
            + "OR e.empId LIKE %:searchTerm% OR e.state LIKE %:searchTerm%")
    List<Employee> searchEmployees(@Param("searchTerm") String searchTerm);
}
