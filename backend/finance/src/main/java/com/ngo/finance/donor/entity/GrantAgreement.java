package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.GrantStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Grant Agreement entity - Aggregate Root.
 */
@Entity
@Table(name = "grant_agreement")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "donor", "fundProfile" }, callSuper = true)
@ToString(exclude = { "donor", "fundProfile" })
public class GrantAgreement extends AuditEntity {

        @Column(nullable = false, unique = true, length = 20)
        private String grantCode;

        @ManyToOne
        @JoinColumn(name = "donor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_grant_donor"))
        private DonorMaster donor;

        // The fund profile this grant inherits (donor, programme, class A/B/C, rules).
        @ManyToOne
        @JoinColumn(name = "fund_profile_id", foreignKey = @ForeignKey(name = "fk_grant_fund_profile"))
        private DonorFundProfile fundProfile;

        @Column(nullable = false, length = 255)
        private String agreementName;

        @Column(nullable = false)
        private LocalDate agreementDate;

        @Column(nullable = false)
        private LocalDate startDate;

        @Column(nullable = false)
        private LocalDate endDate;

        @Column(nullable = false, precision = 15, scale = 2)
        private BigDecimal totalGrantAmount;

        @Column(columnDefinition = "TEXT")
        private String description;

        @Column(length = 500)
        private String agreementDocumentPath;

        @Column(name = "approved_by")
        private Long approvedBy;

        @Column(name = "approval_remarks", columnDefinition = "TEXT")
        private String approvalRemarks;

        @Column(name = "is_approved", nullable = false)
        @Builder.Default
        private Integer isApproved = 2; // 1 = approved, 2 = pending, 3 = on hold, 4 = completed

        @Column(name = "approval_date")
        private LocalDateTime approvalDate;

        @Column(name = "grant_status", nullable = false, length = 20)
        @Enumerated(EnumType.STRING)
        @Builder.Default
        private GrantStatus grantStatus = GrantStatus.ACTIVE;

        @Column(nullable = false)
        @Builder.Default
        private Boolean isActive = true;
}