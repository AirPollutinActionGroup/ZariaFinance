package com.ngo.finance.paymentType.group.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payment Type Group master entity — chart-of-accounts group (e.g. Balance
 * Sheet, Income & Expenditure Heads) used to classify payment type ledgers.
 */
@Entity
@Table(name = "payment_type_group")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTypeGroup extends AuditEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;
}
