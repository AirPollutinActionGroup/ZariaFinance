package com.ngo.finance.masters.department.repository;

import com.ngo.finance.masters.department.entity.Department;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    boolean existsByName(String name);

    @Query("SELECT d FROM Department d WHERE d.name LIKE %:searchTerm%")
    List<Department> searchByName(@Param("searchTerm") String searchTerm);
}
