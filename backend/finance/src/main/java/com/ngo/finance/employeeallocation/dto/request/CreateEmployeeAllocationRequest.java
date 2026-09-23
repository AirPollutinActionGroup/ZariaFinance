package com.ngo.finance.employeeallocation.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEmployeeAllocationRequest {

    @NotNull(message = "Employee is required")
    private Long employeeId;

    /** The Program — a Programme row with type=Programme. */
    @NotNull(message = "Program is required")
    private Long programmeId;

    /** The Project — a Programme row with type=Project, parented under programmeId. */
    @NotNull(message = "Project is required")
    private Long projectId;

    private String role;

    private List<Long> stateIds;

    private List<Long> cityIds;

    @NotNull(message = "Allocation % is required")
    @Min(value = 1, message = "Allocation % must be between 1 and 100")
    @Max(value = 100, message = "Allocation % must be between 1 and 100")
    private Integer allocationPct;

    private LocalDate startDate;

    private LocalDate endDate;

    private String remark;
}
