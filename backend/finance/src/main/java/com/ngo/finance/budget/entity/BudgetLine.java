package com.ngo.finance.budget.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.masters.budgetcategory.entity.BudgetCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One budget line: a category head, a description, its book (LC / FC) and the
 * amount phased across the four FY quarters (Q1 Apr–Jun … Q4 Jan–Mar).
 */
@Entity
@Table(name = "budget_line")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetLine extends AuditEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_id", nullable = false)
    private Budget budget;

    /** 1-based position; displayed as BL-01, BL-02… */
    @Column(name = "line_no", nullable = false)
    private Integer lineNo;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private BudgetCategory category;

    @Column(nullable = false, length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 2)
    private ContributionType book;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal q1 = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal q2 = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal q3 = BigDecimal.ZERO;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal q4 = BigDecimal.ZERO;

    public BigDecimal getTotal() {
        return q1.add(q2).add(q3).add(q4);
    }
}
