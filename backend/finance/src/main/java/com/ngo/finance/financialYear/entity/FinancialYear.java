package com.ngo.finance.financialYear.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Financial year master entity — an accounting period (typically an Apr–Mar
 * cycle) used to scope budgets, transactions and reporting. Exactly one row
 * may be marked current at a time.
 */
@Entity
@Table(name = "financial_year")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialYear extends AuditEntity {

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "is_current", nullable = false)
    @Builder.Default
    private Boolean current = false;
}
