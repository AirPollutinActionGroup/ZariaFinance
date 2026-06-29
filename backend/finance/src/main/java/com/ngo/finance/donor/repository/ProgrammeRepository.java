package com.ngo.finance.donor.repository;

import com.ngo.finance.donor.entity.Programme;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProgrammeRepository extends JpaRepository<Programme, Long> {

    Optional<Programme> findByProgrammeCode(String programmeCode);

    List<Programme> findByIsActive(Boolean isActive);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Programme p WHERE p.programmeName LIKE %:searchTerm%")
    List<Programme> searchByName(String searchTerm);
}
