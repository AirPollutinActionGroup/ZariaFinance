package com.ngo.finance.budget.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Budget as returned by the API. The list endpoint leaves {@code lines},
 * {@code history} and {@code notes} out (null → omitted); the detail endpoint
 * includes them.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BudgetResponse {

    private Long id;

    private String budgetCode;

    private String name;

    /** Label, e.g. "2026-27" (derived from the linked year's start date). */
    private String financialYear;

    /** Financial Year master id and code, e.g. 3 / "FY 2026-27". */
    private Long financialYearId;

    private String financialYearCode;

    /** PROGRAMME | ORGANISATION */
    private String budgetType;

    private Long programmeId;

    private String programmeName;

    /** Programme name, or "Organisation-wide". */
    private String scope;

    private Long stateId;

    /** Null = all states. */
    private String stateName;

    private String owner;

    private String notes;

    /** DRAFT | SUBMITTED | APPROVED | REJECTED */
    private String status;

    private BigDecimal total;

    private Integer lineCount;

    private List<Line> lines;

    private List<HistoryEntry> history;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class Line {
        private Long id;
        private Integer lineNo;
        /** BL-01, BL-02… */
        private String lineCode;
        private Long categoryId;
        private String categoryName;
        private Boolean categoryActive;
        private String description;
        private String book;
        private BigDecimal q1;
        private BigDecimal q2;
        private BigDecimal q3;
        private BigDecimal q4;
        private BigDecimal total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HistoryEntry {
        private String status;
        private LocalDateTime at;
        private String by;
        private String note;
    }
}
