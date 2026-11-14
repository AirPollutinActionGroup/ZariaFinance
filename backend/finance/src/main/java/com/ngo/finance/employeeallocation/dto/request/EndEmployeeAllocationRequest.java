package com.ngo.finance.employeeallocation.dto.request;

import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Ends an allocation. Without an end date it ends today. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EndEmployeeAllocationRequest {

    private LocalDate endDate;

    @Size(max = 1000, message = "Note is too long")
    private String note;
}
