package com.ngo.finance.employee.dto.request;

import com.ngo.finance.employee.EmployeeStatuses;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
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

    @NotEmpty(message = "At least one state is required")
    private List<Long> stateIds;

    private List<Long> cityIds;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    private LocalDate exitDate;

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

    /** Defaults to "Active" when omitted. */
    @Pattern(regexp = EmployeeStatuses.PATTERN, message = "Status is not a recognised value")
    private String status;

    private String remark;
    // ---- PAN and salary bank account (all optional; blank is treated as not given) ----

    @Pattern(regexp = "^$|[A-Za-z]{5}[0-9]{4}[A-Za-z]", message = "Enter a valid PAN (e.g. ABCDE1234F)")
    private String panNumber;

    @Size(max = 255, message = "Account holder name is too long")
    private String accountHolderName;

    @Size(max = 255, message = "Bank name is too long")
    private String bankName;

    @Pattern(regexp = "^$|Savings|Current|Salary", message = "Account type is not a recognised value")
    private String accountType;

    @Pattern(regexp = "^$|[0-9]{9,18}", message = "Account number must be 9 to 18 digits")
    private String accountNumber;

    @Pattern(regexp = "^$|[A-Za-z]{4}0[A-Za-z0-9]{6}", message = "Enter a valid IFSC code (e.g. HDFC0000123)")
    private String ifscCode;

    @Size(max = 255, message = "Branch name is too long")
    private String branchName;
}
