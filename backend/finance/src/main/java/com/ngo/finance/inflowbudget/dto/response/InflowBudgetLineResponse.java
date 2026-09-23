package com.ngo.finance.inflowbudget.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One expected receipt row on the Inflow Budget — a donor tranche criterion,
 * enriched with its funding source, donor and book, plus receipt detail once
 * recorded.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InflowBudgetLineResponse {

    private Long id;
    private String line;
    private String fundingSource; // RESTRICTED | UNRESTRICTED
    private String donor;
    private String book; // LC | FC

    private LocalDate expectedDate;
    private BigDecimal expectedAmount;

    private LocalDate actualDate;
    private BigDecimal actualAmount;

    private String receiptRef;
    private String receiptNo;
    private String varianceReason;
}
