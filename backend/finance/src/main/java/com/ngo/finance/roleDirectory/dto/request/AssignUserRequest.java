package com.ngo.finance.roleDirectory.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for assigning a user to a Role Directory entry
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignUserRequest {

    @NotNull(message = "User is required")
    private Long userId;
}
