package com.ngo.finance.employee.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a new Employee.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeRequest {

    @NotBlank(message = "Employee ID is required")
    private String empId;

    @NotBlank(message = "Employee name is required")
    private String name;

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotNull(message = "Designation is required")
    private Long designationId;

    @NotBlank(message = "Bucket is required")
    @Pattern(regexp = "Admin|Project", message = "Bucket is not a recognised value")
    private String bucket;

    /** Required only when bucket is "Project" — enforced in the service layer. */
    private Long primaryProgrammeId;

    @NotBlank(message = "State is required")
    private String state;

    @NotNull(message = "Annual CTC is required")
    @DecimalMin(value = "0.01", message = "Annual CTC must be greater than zero")
    private BigDecimal annualCtc;

    @NotBlank(message = "Employment type is required")
    @Pattern(regexp = "Permanent|Contract", message = "Employment type is not a recognised value")
    private String employmentType;

    @NotBlank(message = "PF is required")
    @Pattern(regexp = "Yes|No", message = "Must be Yes or No")
    private String pf;

    @NotBlank(message = "ESI is required")
    @Pattern(regexp = "Yes|No", message = "Must be Yes or No")
    private String esi;

    @NotBlank(message = "Gratuity is required")
    @Pattern(regexp = "Yes|No", message = "Must be Yes or No")
    private String gratuity;

    /** Defaults to active when omitted. */
    private Boolean status;
}
