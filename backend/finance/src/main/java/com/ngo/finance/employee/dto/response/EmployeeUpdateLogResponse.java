package com.ngo.finance.employee.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for one employee update-log entry.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmployeeUpdateLogResponse {

    private Long id;

    private String fieldName;

    private String oldValue;

    private String newValue;

    private LocalDateTime changedAt;

    private String changedBy;
}
