package com.ngo.finance.roleDirectory.service.impl;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.roleDirectory.dto.request.AssignUserRequest;
import com.ngo.finance.roleDirectory.dto.request.CreateRoleRequest;
import com.ngo.finance.roleDirectory.dto.request.UpdateRoleRequest;
import com.ngo.finance.roleDirectory.dto.response.RoleResponse;
import com.ngo.finance.roleDirectory.dto.response.RoleUserResponse;
import com.ngo.finance.roleDirectory.entity.RoleMaster;
import com.ngo.finance.roleDirectory.entity.RoleMasterUser;
import com.ngo.finance.roleDirectory.mapper.RoleMapper;
import com.ngo.finance.roleDirectory.repository.RoleMasterRepository;
import com.ngo.finance.roleDirectory.repository.RoleMasterUserRepository;
import com.ngo.finance.roleDirectory.service.RoleMasterService;
import com.ngo.finance.userRegisterNew.entity.UserRegisterNew;
import com.ngo.finance.userRegisterNew.repository.UserRegisterNewRepository;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Role Directory operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RoleMasterServiceImpl implements RoleMasterService {

    /** Must mirror frontend/src/core/permissions/permissions.js ROLES. */
    private static final Set<String> PERMISSION_ROLES = Set.of("CEO", "FINANCE_OFFICER", "FUNDRAISING_LEAD");

    private final RoleMasterRepository roleMasterRepository;

    private final RoleMasterUserRepository roleMasterUserRepository;

    private final UserRegisterNewRepository userRegisterNewRepository;

    private final RoleMapper roleMapper;

    @Override
    public RoleResponse createRole(CreateRoleRequest request) {
        log.info("Registering new role: {}", request.getRoleName());

        if (roleMasterRepository.existsByRoleName(request.getRoleName())) {
            throw new ValidationException("A role with name '" + request.getRoleName() + "' already exists");
        }

        String shortName = normalizeShortName(request.getShortName());
        if (roleMasterRepository.existsByShortName(shortName)) {
            throw new ValidationException("A role with short name '" + shortName + "' already exists");
        }

        String permissionRole = normalizePermissionRole(request.getPermissionRole());

        RoleMaster role = roleMapper.toEntity(request);
        role.setShortName(shortName);
        role.setPermissionRole(permissionRole);
        role.setStatus(true);

        RoleMaster saved = roleMasterRepository.save(role);
        log.info("Role registered successfully with id: {}", saved.getId());

        return toResponseWithCount(saved);
    }

    private static String normalizePermissionRole(String permissionRole) {
        String normalized = permissionRole == null ? null : permissionRole.trim().toUpperCase();
        if (!PERMISSION_ROLES.contains(normalized)) {
            throw new ValidationException(
                    "Permission role must be one of " + PERMISSION_ROLES + ", got '" + permissionRole + "'");
        }
        return normalized;
    }

    private RoleResponse toResponseWithCount(RoleMaster role) {
        RoleResponse response = roleMapper.toResponse(role);
        response.setAssignedUserCount(roleMasterUserRepository.countByRoleMasterId(role.getId()));
        return response;
    }

    private static String fullName(UserRegisterNew user) {
        String name = ((user.getFirstName() == null ? "" : user.getFirstName()) + " "
                + (user.getLastName() == null ? "" : user.getLastName())).trim();
        return name.isEmpty() ? user.getUsername() : name;
    }

    /** Parses userLimit; blank or non-numeric values mean "no cap". */
    private static Integer parseLimit(String userLimit) {
        if (userLimit == null || userLimit.isBlank()) return null;
        try {
            return Integer.parseInt(userLimit.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean shortNameExists(String shortName) {
        return roleMasterRepository.existsByShortName(normalizeShortName(shortName));
    }

    private static String normalizeShortName(String shortName) {
        return shortName == null ? null : shortName.trim().toLowerCase();
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getRoleById(Long id) {
        log.debug("Fetching role with id: {}", id);
        RoleMaster role = roleMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));
        return toResponseWithCount(role);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllRoles() {
        log.debug("Fetching all roles");
        return roleMasterRepository.findAll().stream()
                .map(this::toResponseWithCount)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> searchRoles(String searchTerm) {
        log.debug("Searching roles with term: {}", searchTerm);
        return roleMasterRepository.searchByNameOrShortName(searchTerm).stream()
                .map(this::toResponseWithCount)
                .toList();
    }

    @Override
    public RoleResponse updateRole(Long id, UpdateRoleRequest request) {
        log.info("Updating role with id: {}", id);

        RoleMaster role = roleMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));

        if (request.getRoleName() != null
                && !request.getRoleName().equals(role.getRoleName())
                && roleMasterRepository.existsByRoleName(request.getRoleName())) {
            throw new ValidationException("A role with name '" + request.getRoleName() + "' already exists");
        }

        if (request.getShortName() != null) {
            String shortName = normalizeShortName(request.getShortName());
            if (!shortName.equals(role.getShortName())
                    && roleMasterRepository.existsByShortName(shortName)) {
                throw new ValidationException("A role with short name '" + shortName + "' already exists");
            }
            request.setShortName(shortName);
        }

        if (request.getPermissionRole() != null) {
            request.setPermissionRole(normalizePermissionRole(request.getPermissionRole()));
        }

        roleMapper.updateEntity(request, role);

        RoleMaster updated = roleMasterRepository.save(role);
        log.info("Role updated successfully");

        return toResponseWithCount(updated);
    }

    @Override
    public void activateRole(Long id) {
        log.info("Activating role with id: {}", id);

        RoleMaster role = roleMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));

        role.setStatus(true);
        roleMasterRepository.save(role);

        log.info("Role activated successfully");
    }

    @Override
    public void deactivateRole(Long id) {
        log.info("Deactivating role with id: {}", id);

        RoleMaster role = roleMasterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));

        role.setStatus(false);
        roleMasterRepository.save(role);

        log.info("Role deactivated successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleUserResponse> getAssignedUsers(Long roleId) {
        log.debug("Fetching users assigned to role with id: {}", roleId);
        if (!roleMasterRepository.existsById(roleId)) {
            throw new ResourceNotFoundException("Role", roleId);
        }

        return roleMasterUserRepository.findByRoleMasterId(roleId).stream()
                .map(assignment -> RoleUserResponse.builder()
                        .userId(assignment.getUserId())
                        .userName(userRegisterNewRepository.findById(assignment.getUserId())
                                .map(RoleMasterServiceImpl::fullName)
                                .orElse(null))
                        .build())
                .toList();
    }

    @Override
    public RoleUserResponse assignUser(Long roleId, AssignUserRequest request) {
        log.info("Assigning user {} to role {}", request.getUserId(), roleId);

        RoleMaster role = roleMasterRepository.findById(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role", roleId));

        UserRegisterNew user = userRegisterNewRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));

        if (roleMasterUserRepository.existsByRoleMasterIdAndUserId(roleId, request.getUserId())) {
            throw new ValidationException("This user is already assigned to this role");
        }

        Integer limit = parseLimit(role.getUserLimit());
        if (limit != null) {
            long currentCount = roleMasterUserRepository.countByRoleMasterId(roleId);
            if (currentCount >= limit) {
                throw new ValidationException(
                        "Role '" + role.getRoleName() + "' has reached its user limit of " + limit);
            }
        }

        RoleMasterUser saved = roleMasterUserRepository.save(RoleMasterUser.builder()
                .roleMasterId(roleId)
                .userId(request.getUserId())
                .build());

        log.info("User assigned successfully to role {}", roleId);

        return RoleUserResponse.builder()
                .userId(saved.getUserId())
                .userName(fullName(user))
                .build();
    }

    @Override
    public void unassignUser(Long roleId, Long userId) {
        log.info("Unassigning user {} from role {}", userId, roleId);

        RoleMasterUser assignment = roleMasterUserRepository.findByRoleMasterIdAndUserId(roleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("This user is not assigned to this role"));

        roleMasterUserRepository.delete(assignment);

        log.info("User unassigned successfully from role {}", roleId);
    }
}
