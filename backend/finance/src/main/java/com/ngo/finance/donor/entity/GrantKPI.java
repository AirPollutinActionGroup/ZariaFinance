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
 * Grant KPI entity - owned by GrantAgreement
 */
@Entity
@Table(name = "grant_kpi")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "grant", callSuper = true)
@ToString(exclude = "grant")
public class GrantKPI extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "grant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_kpi_grant"))
    private GrantAgreement grant;

    @Column(nullable = false, length = 50)
    private String kpiCode;

    @Column(nullable = false, length = 255)
    private String kpiName;

    @Column(length = 100)
    private String kpiUnit;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal targetValue;

    @Column(precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal currentValue = BigDecimal.ZERO;

    @Column(precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal performancePercentage = BigDecimal.ZERO;

    @Column(length = 50)
    private String dataType;
}
