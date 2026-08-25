package com.ngo.finance.roleDirectory.repository;

import com.ngo.finance.roleDirectory.entity.RoleMasterUser;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleMasterUserRepository extends JpaRepository<RoleMasterUser, Long> {

    List<RoleMasterUser> findByRoleMasterId(Long roleMasterId);

    long countByRoleMasterId(Long roleMasterId);

    boolean existsByRoleMasterIdAndUserId(Long roleMasterId, Long userId);

    Optional<RoleMasterUser> findByRoleMasterIdAndUserId(Long roleMasterId, Long userId);
}
