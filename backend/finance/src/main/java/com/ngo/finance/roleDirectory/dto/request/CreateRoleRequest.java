package com.ngo.finance.roleDirectory.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a new role in the Role Directory
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoleRequest {

    @NotBlank(message = "Role name is required")
    private String roleName;

    @NotBlank(message = "Role short name is required")
    private String shortName;

    @NotBlank(message = "User limit is required")
    private String userLimit;

    @NotBlank(message = "Permission role is required")
    private String permissionRole;
}
