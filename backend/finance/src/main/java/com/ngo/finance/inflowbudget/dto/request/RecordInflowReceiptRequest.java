package com.ngo.finance.inflowbudget.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Request DTO for recording an actual receipt against an Inflow Budget line. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecordInflowReceiptRequest {

    @NotNull(message = "Actual receipt date is required")
    private LocalDate actualDate;

    @NotNull(message = "Actual amount is required")
    @Positive(message = "Actual amount must be positive")
    private BigDecimal actualAmount;

    private String receiptRef;

    private String receiptNo;

    private String varianceReason;

    /** Set when this receipt is posted by a transaction, rather than recorded manually. */
    private Long transactionId;
}
