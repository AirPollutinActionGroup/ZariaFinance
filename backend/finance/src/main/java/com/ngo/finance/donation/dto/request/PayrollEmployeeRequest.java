package com.ngo.finance.donation.dto.request;

import com.ngo.finance.donation.enums.Citizenship;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollEmployeeRequest {

    @NotBlank(message = "Employee name is required")
    private String name;

    private String idType;

    private String idNumber;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotNull(message = "Citizenship is required")
    private Citizenship citizenship;
}
