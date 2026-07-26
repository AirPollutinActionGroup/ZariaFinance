package com.ngo.finance.donation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donation.enums.MandateFrequency;
import com.ngo.finance.donation.enums.MandateStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Recurring-giving detail — a mandate, not a tranche. No release criteria, no
 * verification steps. Income is recognised per successful debit, never a
 * year upfront (recognised on the parent Donation as debits post — the debit
 * ledger itself is a follow-up, out of scope for this pass).
 */
@Entity
@Table(name = "donation_recurring_mandate")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "donation", callSuper = true)
@ToString(exclude = "donation")
public class DonationRecurringMandate extends AuditEntity {

    @OneToOne
    @JoinColumn(name = "donation_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_recurring_mandate_donation"))
    private Donation donation;

    @Column(name = "mandate_id", nullable = false, length = 100)
    private String mandateId;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private MandateFrequency frequency;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "mandate_status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MandateStatus mandateStatus = MandateStatus.ACTIVE;

    @Column(name = "next_expected_debit_date")
    private LocalDate nextExpectedDebitDate;

    @Column(name = "sponsorship_tie", length = 100)
    private String sponsorshipTie;
}
