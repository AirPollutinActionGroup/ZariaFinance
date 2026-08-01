package com.ngo.finance.donation.dto.request;

import com.ngo.finance.donation.enums.EmployerMatchRouting;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
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

    @PositiveOrZero(message = "Match amount must be zero or positive")
    private BigDecimal matchAmount;

    /** Only meaningful when employerMatchRouting is CSR_ROUTED. */
    private String csrFinancialYear;

    private String csrProjectRef;

    @NotEmpty(message = "At least one employee is required")
    @Valid
    private List<PayrollEmployeeRequest> employees;
}
