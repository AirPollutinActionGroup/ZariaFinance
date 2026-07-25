package com.ngo.finance.donation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donation.enums.Citizenship;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * One employee's donation within a payroll-giving remittance. Citizenship
 * drives which book the amount posts to — Indian citizens post to LC,
 * foreign citizens must post to the FCRA account only.
 */
@Entity
@Table(name = "donation_payroll_employee")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "batch", callSuper = true)
@ToString(exclude = "batch")
public class DonationPayrollEmployee extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "batch_id", nullable = false, foreignKey = @ForeignKey(name = "fk_payroll_employee_batch"))
    private DonationPayrollBatch batch;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "id_type", length = 30)
    private String idType;

    @Column(name = "id_number", length = 50)
    private String idNumber;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private Citizenship citizenship;
}
