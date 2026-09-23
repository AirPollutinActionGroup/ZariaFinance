package com.ngo.finance.roleDirectory.service;

import com.ngo.finance.roleDirectory.dto.request.AssignUserRequest;
import com.ngo.finance.roleDirectory.dto.request.CreateRoleRequest;
import com.ngo.finance.roleDirectory.dto.request.UpdateRoleRequest;
import com.ngo.finance.roleDirectory.dto.response.RoleResponse;
import com.ngo.finance.roleDirectory.dto.response.RoleUserResponse;
import java.util.List;

/**
 * Service interface for Role Directory operations
 */
public interface RoleMasterService {

    RoleResponse createRole(CreateRoleRequest request);

    boolean shortNameExists(String shortName);

    RoleResponse getRoleById(Long id);

    List<RoleResponse> getAllRoles();

    List<RoleResponse> searchRoles(String searchTerm);

    RoleResponse updateRole(Long id, UpdateRoleRequest request);

    void activateRole(Long id);

    void deactivateRole(Long id);

    List<RoleUserResponse> getAssignedUsers(Long roleId);

    RoleUserResponse assignUser(Long roleId, AssignUserRequest request);

    void unassignUser(Long roleId, Long userId);
}
