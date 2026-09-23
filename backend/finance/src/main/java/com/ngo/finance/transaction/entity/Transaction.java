package com.ngo.finance.transaction.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A Debit (Out) or Credit (In) payment window entry — the "New Transaction"
 * form. Party/donor/fund/grant/payment-mode/group/ledger are stored as FK
 * ids only; the response layer resolves display names from the owning
 * masters.
 */
@Entity
@Table(name = "finance_transaction")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction extends AuditEntity {

    @Column(name = "transaction_code", nullable = false, unique = true, length = 32)
    private String transactionCode;

    /** DEBIT | CREDIT */
    @Column(nullable = false, length = 10)
    private String type;

    /** LC | FC */
    @Column(nullable = false, length = 10)
    private String book;

    @Column(name = "transaction_date", nullable = false)
    private LocalDate transactionDate;

    @Column(nullable = false, length = 50)
    private String category;

    /** Payee id (Debit) or Donor id (Credit) — Payee has no backend master yet, hence a free string. */
    @Column(name = "party_id", nullable = false, length = 50)
    private String partyId;

    @Column(name = "party_name", nullable = false, length = 255)
    private String partyName;

    @Column(name = "donor_id", nullable = false)
    private Long donorId;

    @Column(name = "fund_profile_id", nullable = false)
    private Long fundProfileId;

    @Column(name = "grant_id")
    private Long grantId;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    /** Mock bank-account enum value — no backend master yet. */
    @Column(name = "bank_account", length = 50)
    private String bankAccount;

    @Column(name = "payment_mode_id", nullable = false)
    private Long paymentModeId;

    @Column(length = 255)
    private String reference;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(name = "ledger_id", nullable = false)
    private Long ledgerId;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
