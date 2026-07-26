package com.ngo.finance.donation.dto.request;

import com.ngo.finance.donation.enums.EmployerMatchRouting;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollBatchRequest {

    @NotBlank(message = "Employer is required")
    private String employer;

    private EmployerMatchRouting employerMatchRouting;

    @NotEmpty(message = "At least one employee is required")
    @Valid
    private List<PayrollEmployeeRequest> employees;
}
