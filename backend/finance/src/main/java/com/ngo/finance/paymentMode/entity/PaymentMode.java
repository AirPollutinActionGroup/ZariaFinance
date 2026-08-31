package com.ngo.finance.paymentMode.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payment mode master entity — a financial instrument or payment method
 * (Cash, Cheque, NEFT, UPI, ...) selectable on transaction entries.
 */
@Entity
@Table(name = "payment_mode")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMode extends AuditEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;
}
