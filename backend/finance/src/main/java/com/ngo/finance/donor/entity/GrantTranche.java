package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Grant Tranche entity - owned by GrantAgreement
 */
@Entity
@Table(name = "grant_tranche")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "grant", callSuper = true)
@ToString(exclude = "grant")
public class GrantTranche extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "grant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_tranche_grant"))
    private GrantAgreement grant;

    @Column(nullable = false)
    private Integer trancheNumber;

    @Column(length = 255)
    private String trancheName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal trancheAmount;

    @Column
    private LocalDate plannedReleaseDate;

    @Column
    private LocalDate actualReleaseDate;

    @Column(columnDefinition = "TEXT")
    private String conditionsToRelease;

    @Column(length = 50, nullable = false)
    @Builder.Default
    private String trancheStatus = "PENDING";
}
