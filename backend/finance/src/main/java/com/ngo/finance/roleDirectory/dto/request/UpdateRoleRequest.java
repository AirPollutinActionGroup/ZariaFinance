package com.ngo.finance.roleDirectory.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a role in the Role Directory
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleRequest {

    private String roleName;

    private String shortName;

    private String userLimit;

    private String permissionRole;
}
