package com.ngo.finance.inflowbudget.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.entity.DonorTrancheCriterion;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One instalment received against a {@link DonorTrancheCriterion} — a tranche
 * can be receipted in more than one payment (e.g. two separate CREDIT
 * transactions), so each instalment is its own row rather than being
 * squashed into a semicolon-joined string on the criterion.
 */
@Entity
@Table(name = "inflow_receipt")
@Getter
@Setter
@NoArgsConstructor
public class InflowReceipt extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "tranche_criterion_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_inflow_receipt_criterion"))
    private DonorTrancheCriterion trancheCriterion;

    @Column(name = "received_date", nullable = false)
    private LocalDate receivedDate;

    @Column(name = "received_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal receivedAmount;

    @Column(name = "bank_reference", length = 100)
    private String bankReference;

    @Column(name = "receipt_voucher_no", length = 100)
    private String receiptVoucherNo;

    @Column(name = "variance_reason", length = 500)
    private String varianceReason;

    /**
     * The finance_transaction.id that posted this instalment, if any — a loose
     * reference across modules (like Transaction.inflowBudgetLineId), not a JPA
     * relation. Null for receipts recorded manually rather than via a transaction.
     */
    @Column(name = "transaction_id")
    private Long transactionId;
}
