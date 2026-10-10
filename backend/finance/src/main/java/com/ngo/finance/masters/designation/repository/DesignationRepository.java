package com.ngo.finance.masters.designation.repository;

import com.ngo.finance.masters.designation.entity.Designation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DesignationRepository extends JpaRepository<Designation, Long> {

    boolean existsByNameAndDepartmentId(String name, Long departmentId);

    boolean existsByNameAndDepartmentIdIsNull(String name);

    Optional<Designation> findByName(String name);

    @Query("SELECT d FROM Designation d WHERE d.name LIKE %:searchTerm%")
    List<Designation> searchByName(@Param("searchTerm") String searchTerm);
}
