package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.DisbursementType;
import com.ngo.finance.donor.enums.ScheduleType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * How one grant's funds are released (Disbursement Rules §1) — one row per grant.
 *
 * The committed total lives on the grant ({@code totalGrantAmount}), not here:
 * finalisation requires Σ tranche amounts to equal it, and a second stored copy
 * could only ever disagree.
 */
@Entity
@Table(name = "grant_disbursement_schedule")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "grant", callSuper = true)
@ToString(exclude = "grant")
public class GrantDisbursementSchedule extends AuditEntity {

    @OneToOne
    @JoinColumn(name = "grant_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_disbursement_grant"))
    private GrantAgreement grant;

    @Column(name = "disbursement_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private DisbursementType disbursementType;

    /** Lump sum only: the single date the money is expected. */
    @Column(name = "receiving_date")
    private LocalDate receivingDate;

    /** Tranches only: the cadence each tranche echoes as its read-only frequency. */
    @Column(name = "schedule_type", length = 20)
    @Enumerated(EnumType.STRING)
    private ScheduleType scheduleType;

    /**
     * Set once the tranche amounts add up to the grant total. Editing stays
     * allowed afterwards — finalisation records that the plan was complete and
     * balanced, it is not a lock.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean finalised = false;

    @Column(name = "finalised_at")
    private LocalDateTime finalisedAt;
}
