package com.ngo.finance.organizationRegister.repository;

import com.ngo.finance.organizationRegister.entity.OrganizationRegister;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationRegisterRepository extends JpaRepository<OrganizationRegister, Long> {

    boolean existsByEmail(String email);

    Optional<OrganizationRegister> findByEmail(String email);

    boolean existsByShortName(String shortName);

    @Query("SELECT o FROM OrganizationRegister o WHERE o.name LIKE %:searchTerm% OR o.shortName LIKE %:searchTerm%")
    List<OrganizationRegister> searchByNameOrShortName(@Param("searchTerm") String searchTerm);
}
