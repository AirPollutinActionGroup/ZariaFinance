package com.ngo.finance.inflowbudget.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One expected receipt row on the Inflow Budget — a donor tranche criterion,
 * enriched with its funding source, donor and book, plus what was received:
 * the credit notes raised against it.
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

    /** Date of the latest credit note; null until something is received. */
    private LocalDate actualDate;
    /** Σ credit notes; null until something is received. */
    private BigDecimal actualAmount;

    /** The credit notes' references and codes, oldest first, "; "-joined. */
    private String receiptRef;
    private String receiptNo;

    /** Every instalment (credit note), oldest first. */
    private List<ReceiptItem> receipts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceiptItem {
        private LocalDate date;
        private BigDecimal amount;
        private String reference;
        /** Credit note code, e.g. CN-2026-001. */
        private String creditNoteId;
    }
}
