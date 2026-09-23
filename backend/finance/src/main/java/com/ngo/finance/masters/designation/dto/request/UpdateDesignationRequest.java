package com.ngo.finance.masters.designation.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a designation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDesignationRequest {

    private String name;

    private Long departmentId;
}
