package com.ngo.finance.outflow.entity;

import com.ngo.finance.budget.entity.BudgetLine;
import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.common.enums.ContributionType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * A debit (out) payment against one outflow row — a budget line's quarter.
 * Every note adds to that row's Spent. Master picks are id + name snapshots.
 */
@Entity
@Table(name = "debit_note")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DebitNote extends AuditEntity {

    @Column(name = "note_code", nullable = false, unique = true, length = 30, updatable = false)
    private String noteCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_line_id", nullable = false)
    private BudgetLine budgetLine;

    /** 1..4 (Q1 Apr–Jun … Q4 Jan–Mar). */
    @Column(nullable = false)
    private Short quarter;

    @Column(name = "note_date", nullable = false)
    private LocalDate noteDate;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(length = 40)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 2)
    private ContributionType book;

    @Column(name = "payee_category", nullable = false, length = 20)
    private String payeeCategory;

    @Column(name = "payee_ref", length = 64)
    private String payeeRef;

    @Column(name = "payee_name", nullable = false)
    private String payeeName;

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

    @Column(name = "group_name", nullable = false)
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

    @Column(length = 255)
    private String reference;

    @Column(length = 1000)
    private String remarks;

    @Column(name = "attachment_name")
    private String attachmentName;
}
