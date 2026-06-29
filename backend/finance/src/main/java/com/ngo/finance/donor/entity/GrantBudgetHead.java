package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Grant Budget Head entity - owned by GrantAgreement
 */
@Entity
@Table(name = "grant_budget_head")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "grant", callSuper = true)
@ToString(exclude = "grant")
public class GrantBudgetHead extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "grant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_budget_grant"))
    private GrantAgreement grant;

    @Column(nullable = false, length = 50)
    private String headCode;

    @Column(nullable = false, length = 255)
    private String headName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal budgetedAmount;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal percentageSpent = BigDecimal.ZERO;
}
