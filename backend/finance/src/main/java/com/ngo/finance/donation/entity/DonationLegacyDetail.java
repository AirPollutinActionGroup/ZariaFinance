package com.ngo.finance.donation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donation.enums.BequestStatus;
import com.ngo.finance.donation.enums.EstateDomicile;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Legacy / bequest detail. Not income until probate clears and the amount is
 * certain — recognition date is when probate clears, not when notified.
 */
@Entity
@Table(name = "donation_legacy_detail")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "donation", callSuper = true)
@ToString(exclude = "donation")
public class DonationLegacyDetail extends AuditEntity {

    @OneToOne
    @JoinColumn(name = "donation_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_legacy_detail_donation"))
    private Donation donation;

    @Column(name = "bequest_status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private BequestStatus bequestStatus;

    @Column(name = "probate_reference", length = 255)
    private String probateReference;

    @Column(name = "expected_value", precision = 18, scale = 2)
    private BigDecimal expectedValue;

    @Column(name = "estate_domicile", nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private EstateDomicile estateDomicile;
}
