package com.ngo.finance.roleDirectory.repository;

import com.ngo.finance.roleDirectory.entity.RoleMaster;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleMasterRepository extends JpaRepository<RoleMaster, Long> {

    boolean existsByRoleName(String roleName);

    boolean existsByShortName(String shortName);

    Optional<RoleMaster> findByRoleName(String roleName);

    @Query("SELECT r FROM RoleMaster r WHERE r.roleName LIKE %:searchTerm% OR r.shortName LIKE %:searchTerm%")
    List<RoleMaster> searchByNameOrShortName(@Param("searchTerm") String searchTerm);
}
