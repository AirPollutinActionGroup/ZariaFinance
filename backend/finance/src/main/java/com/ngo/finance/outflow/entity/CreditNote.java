package com.ngo.finance.outflow.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.common.enums.ContributionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "credit_note")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditNote extends AuditEntity {

    @Column(name = "note_code", nullable = false, unique = true, length = 30, updatable = false)
    private String noteCode;

    @Column(name = "note_date", nullable = false)
    private LocalDate noteDate;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 2)
    private ContributionType book;

    @Column(name = "payment_mode_ref", length = 64)
    private String paymentModeRef;

    @Column(name = "payment_mode_name", nullable = false)
    private String paymentModeName;

    @Column(name = "bank_account_ref", length = 64)
    private String bankAccountRef;

    @Column(name = "bank_account_name")
    private String bankAccountName;

    @Column(name = "group_ref", length = 64)
    private String groupRef;

    @Column(name = "group_name")
    private String groupName;

    @Column(name = "ledger_ref", length = 64)
    private String ledgerRef;

    @Column(name = "ledger_name")
    private String ledgerName;

    @Column(name = "donor_ref", length = 64)
    private String donorRef;

    @Column(name = "donor_name")
    private String donorName;

    @Column(name = "fund_profile_ref", length = 64)
    private String fundProfileRef;

    @Column(name = "fund_profile_name")
    private String fundProfileName;

    @Column(name = "grant_ref", length = 64)
    private String grantRef;

    @Column(name = "grant_name")
    private String grantName;

    @Column(name = "disbursement_type", length = 40)
    private String disbursementType;

    @Column(name = "tranche_ref", length = 64)
    private String trancheRef;

    @Column(name = "tranche_name")
    private String trancheName;

    @Column(length = 255)
    private String reference;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "attachment_name")
    private String attachmentName;
}
