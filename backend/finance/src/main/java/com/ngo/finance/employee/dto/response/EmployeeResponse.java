package com.ngo.finance.employee.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Employee
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeResponse {

    private Long id;

    private String empId;

    private String name;

    private String department;

    private String designation;

    private String bucket;

    private String primaryProgramme;

    private String state;

    private BigDecimal annualCtc;

    private String employmentType;

    private String pf;

    private String esi;

    private String gratuity;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;
}
