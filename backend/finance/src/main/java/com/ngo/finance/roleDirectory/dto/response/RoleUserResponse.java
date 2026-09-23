package com.ngo.finance.roleDirectory.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for a user assigned to a Role Directory entry
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleUserResponse {

    private Long userId;

    private String userName;
}
