package com.ngo.finance.employee.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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

    private Long departmentId;

    private String departmentName;

    private Long designationId;

    private String designationName;

    private String bucket;

    private List<Long> stateIds;

    private List<String> stateNames;

    private List<Long> cityIds;

    private List<String> cityNames;

    private LocalDate joiningDate;

    private LocalDate exitDate;

    private BigDecimal annualCtc;

    private String employmentType;

    private String pf;

    private String esi;

    private String gratuity;

    private String status;

    private String remark;

    private String panNumber;

    private String accountHolderName;

    private String bankName;

    private String accountType;

    private String accountNumber;

    private String ifscCode;

    private String branchName;

    /** Uploaded identity documents (metadata only — download via /documents/{type}). */
    private List<EmployeeDocumentResponse> documents;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;
}
