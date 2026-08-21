package com.ngo.finance.roleDirectory.api;

import com.ngo.finance.roleDirectory.dto.request.AssignUserRequest;
import com.ngo.finance.roleDirectory.dto.request.CreateRoleRequest;
import com.ngo.finance.roleDirectory.dto.request.UpdateRoleRequest;
import com.ngo.finance.roleDirectory.dto.response.RoleResponse;
import com.ngo.finance.roleDirectory.dto.response.RoleUserResponse;
import com.ngo.finance.roleDirectory.service.RoleMasterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Role Directory operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/roles")
@Tag(name = "Role Directory", description = "Role Directory Management APIs")
public class RoleMasterController {

    private final RoleMasterService roleMasterService;

    @PostMapping
    @Operation(summary = "Register a new role")
    public ResponseEntity<RoleResponse> createRole(
            @Valid @RequestBody CreateRoleRequest request) {
        log.info("POST /api/v1/roles - Registering new role");
        RoleResponse response = roleMasterService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/verify-short-name")
    @Operation(summary = "Check whether a role short name is already taken")
    public ResponseEntity<Map<String, Object>> verifyShortName(@RequestParam String shortName) {
        log.info("GET /api/v1/roles/verify-short-name - Checking short name: {}", shortName);
        boolean exists = roleMasterService.shortNameExists(shortName);

        Map<String, Object> response = new HashMap<>();
        response.put("shortName", shortName);
        response.put("exists", exists);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID")
    public ResponseEntity<RoleResponse> getRole(@PathVariable Long id) {
        log.info("GET /api/v1/roles/{} - Fetching role", id);
        return ResponseEntity.ok(roleMasterService.getRoleById(id));
    }

    @GetMapping
    @Operation(summary = "Get all roles")
    public ResponseEntity<List<RoleResponse>> getAllRoles(
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/roles - Fetching all roles");
        List<RoleResponse> response = (search != null && !search.isBlank())
                ? roleMasterService.searchRoles(search)
                : roleMasterService.getAllRoles();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a role")
    public ResponseEntity<RoleResponse> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        log.info("PUT /api/v1/roles/{} - Updating role", id);
        return ResponseEntity.ok(roleMasterService.updateRole(id, request));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a role")
    public ResponseEntity<Void> activateRole(@PathVariable Long id) {
        log.info("PATCH /api/v1/roles/{}/activate - Activating role", id);
        roleMasterService.activateRole(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a role")
    public ResponseEntity<Void> deactivateRole(@PathVariable Long id) {
        log.info("PATCH /api/v1/roles/{}/deactivate - Deactivating role", id);
        roleMasterService.deactivateRole(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/users")
    @Operation(summary = "Get users assigned to a role")
    public ResponseEntity<List<RoleUserResponse>> getAssignedUsers(@PathVariable Long id) {
        log.info("GET /api/v1/roles/{}/users - Fetching assigned users", id);
        return ResponseEntity.ok(roleMasterService.getAssignedUsers(id));
    }

    @PostMapping("/{id}/users")
    @Operation(summary = "Assign a user to a role")
    public ResponseEntity<RoleUserResponse> assignUser(
            @PathVariable Long id,
            @Valid @RequestBody AssignUserRequest request) {
        log.info("POST /api/v1/roles/{}/users - Assigning user {}", id, request.getUserId());
        RoleUserResponse response = roleMasterService.assignUser(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}/users/{userId}")
    @Operation(summary = "Unassign a user from a role")
    public ResponseEntity<Void> unassignUser(@PathVariable Long id, @PathVariable Long userId) {
        log.info("DELETE /api/v1/roles/{}/users/{} - Unassigning user", id, userId);
        roleMasterService.unassignUser(id, userId);
        return ResponseEntity.noContent().build();
    }
}
