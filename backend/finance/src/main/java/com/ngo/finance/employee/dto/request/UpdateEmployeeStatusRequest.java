package com.ngo.finance.employee.dto.request;

import com.ngo.finance.employee.EmployeeStatuses;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for changing an employee's lifecycle status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateEmployeeStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = EmployeeStatuses.PATTERN, message = "Status is not a recognised value")
    private String status;
}
