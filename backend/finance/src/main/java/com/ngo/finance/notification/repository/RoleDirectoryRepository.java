package com.ngo.finance.notification.repository;

import com.ngo.finance.notification.entity.RoleDirectoryEntry;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleDirectoryRepository extends JpaRepository<RoleDirectoryEntry, Long> {

    Optional<RoleDirectoryEntry> findByDesignationId(Long designationId);
}
