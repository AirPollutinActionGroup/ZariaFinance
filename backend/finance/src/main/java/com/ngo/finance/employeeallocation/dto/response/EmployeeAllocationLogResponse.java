package com.ngo.finance.employeeallocation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One event in an employee's allocation history. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeAllocationLogResponse {

    private Long id;

    private Long employeeId;

    private Long allocationId;

    /** CREATED | ENDED | REMOVED */
    private String event;

    private String programmeName;

    private String projectName;

    private String role;

    private Integer allocationPct;

    private LocalDate startDate;

    private LocalDate endDate;

    private String stateNames;

    private String cityNames;

    private String note;

    private LocalDateTime changedAt;

    private String changedBy;
}
