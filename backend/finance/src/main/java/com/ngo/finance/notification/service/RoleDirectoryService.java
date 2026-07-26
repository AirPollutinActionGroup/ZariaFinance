package com.ngo.finance.notification.service;

import com.ngo.finance.donor.enums.ResponsibleRole;
import com.ngo.finance.notification.dto.RoleDirectoryEntryDto;
import java.util.List;
import java.util.Optional;

/**
 * Resolves organisational roles to the people who hold them (Disbursement Rules
 * §5). The deputy is a notification target only — nothing here confers authority.
 */
public interface RoleDirectoryService {

    List<RoleDirectoryEntryDto> getDirectory();

    /** Replaces the holders for the given roles; unmentioned roles are untouched. */
    List<RoleDirectoryEntryDto> updateDirectory(List<RoleDirectoryEntryDto> entries);

    Optional<RoleDirectoryEntryDto> findByRole(ResponsibleRole role);
}
