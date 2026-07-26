package com.ngo.finance.donation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Singleton, org-level tax/registration facts the donation tax chain (80G,
 * Form 10BD, Form 10BE) evaluates against. Exactly one row is expected to
 * exist — seeded by migration — and it is fetched by taking the first row,
 * not by a fixed id, so it stays resilient to how it was seeded.
 */
@Entity
@Table(name = "tenant_tax_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TenantTaxConfig extends AuditEntity {

    @Column(name = "org_80g_registration_number", nullable = false, length = 50)
    private String org80gRegistrationNumber;

    @Column(name = "org_80g_valid_from", nullable = false)
    private LocalDate org80gValidFrom;

    @Column(name = "org_80g_valid_to", nullable = false)
    private LocalDate org80gValidTo;

    @Column(name = "section_35_registration_number", length = 50)
    private String section35RegistrationNumber;

    @Column(name = "section_35_valid_from")
    private LocalDate section35ValidFrom;

    @Column(name = "section_35_valid_to")
    private LocalDate section35ValidTo;

    // Current counter; incremented each time an 80G receipt is issued.
    @Column(name = "receipt_number_sequence", nullable = false)
    @Builder.Default
    private Long receiptNumberSequence = 0L;
}
