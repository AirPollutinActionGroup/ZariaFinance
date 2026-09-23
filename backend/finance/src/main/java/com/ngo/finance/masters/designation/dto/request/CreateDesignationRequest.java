package com.ngo.finance.masters.designation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a new designation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDesignationRequest {

    @NotBlank(message = "Designation name is required")
    private String name;

    @NotNull(message = "Department is required")
    private Long departmentId;

    /** Defaults to active when omitted. */
    private Boolean status;
}
