package com.ngo.finance.donation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donation.enums.GikIntendedUse;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Logged history row for a GIK item's intended-use change — e.g. "received to
 * distribute, then sold near expiry". The change is recorded, never silently
 * erased.
 */
@Entity
@Table(name = "donation_gik_intended_use_change")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "gikItem", callSuper = true)
@ToString(exclude = "gikItem")
public class DonationGikIntendedUseChange extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "gik_item_id", nullable = false, foreignKey = @ForeignKey(name = "fk_gik_use_change_item"))
    private DonationGikItem gikItem;

    @Column(name = "from_intended_use", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private GikIntendedUse fromIntendedUse;

    @Column(name = "to_intended_use", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private GikIntendedUse toIntendedUse;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "changed_at", nullable = false)
    @Builder.Default
    private LocalDateTime changedAt = LocalDateTime.now();
}
