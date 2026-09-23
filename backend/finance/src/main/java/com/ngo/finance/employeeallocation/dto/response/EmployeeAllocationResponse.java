package com.ngo.finance.employeeallocation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeAllocationResponse {

    private Long id;

    private Long employeeId;
    private String employeeName;
    private String empCode;

    private Long programmeId;
    private String programmeName;

    private Long projectId;
    private String projectName;

    private String role;

    private List<Long> stateIds;
    private List<String> stateNames;
    private List<Long> cityIds;
    private List<String> cityNames;

    private Integer allocationPct;

    private LocalDate startDate;
    private LocalDate endDate;

    private String remark;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
