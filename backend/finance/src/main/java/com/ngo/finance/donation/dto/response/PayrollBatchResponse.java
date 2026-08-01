package com.ngo.finance.donation.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donation.enums.EmployerMatchRouting;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PayrollBatchResponse {
    private String employer;
    private EmployerMatchRouting employerMatchRouting;
    private BigDecimal matchAmount;
    private String csrFinancialYear;
    private String csrProjectRef;
    private List<PayrollEmployeeResponse> employees;
    private BigDecimal indianTotal;
    private BigDecimal foreignTotal;
}
