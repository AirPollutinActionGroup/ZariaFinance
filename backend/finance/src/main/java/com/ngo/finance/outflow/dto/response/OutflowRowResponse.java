package com.ngo.finance.outflow.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One row of the outflow schedule: a budget line's quarter from an APPROVED
 * budget. Spent = the debit notes on the row.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OutflowRowResponse {

    /** Stable row id, e.g. BUD-2026-001-BL01-Q2 — what debit / credit notes point at. */
    private String id;

    private Long budgetId;

    private String budgetCode;

    private String budgetName;

    private String financialYear;

    /** PROGRAMME | ORGANISATION */
    private String budgetType;

    /** Programme name, or "Organisation-wide". */
    private String scope;

    private String stateName;

    private Long lineId;

    /** BL-01 */
    private String lineCode;

    /** 1..4 */
    private Integer quarter;

    /** Q2 (Jul–Sep) */
    private String quarterLabel;

    private Long categoryId;

    private String categoryName;

    /** The budget line's description. */
    private String line;

    /** LC | FC */
    private String book;

    /** Last day of the quarter. */
    private LocalDate expectedDate;

    private BigDecimal expectedAmount;

    private BigDecimal debitTotal;

    /** = debitTotal */
    private BigDecimal spent;

    /** expectedAmount − spent (negative when over budget). */
    private BigDecimal remaining;

    /** PAID (fully spent) | DUE | PENDING | OVERDUE */
    private String status;
}
