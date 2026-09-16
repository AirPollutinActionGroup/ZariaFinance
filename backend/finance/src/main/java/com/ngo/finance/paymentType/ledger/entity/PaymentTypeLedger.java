package com.ngo.finance.paymentType.ledger.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payment Type Ledger master entity — chart-of-accounts ledger classified
 * under a Payment Type Group.
 */
@Entity
@Table(name = "payment_type_ledger")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTypeLedger extends AuditEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;
}
