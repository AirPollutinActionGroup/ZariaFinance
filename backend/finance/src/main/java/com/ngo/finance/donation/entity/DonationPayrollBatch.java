package com.ngo.finance.donation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donation.enums.EmployerMatchRouting;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Payroll-giving detail. One employer remittance explodes into many
 * individual employee donation rows. The employer is a grouping tag for
 * reporting — the employer is not the donor.
 */
@Entity
@Table(name = "donation_payroll_batch")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"donation", "employees"}, callSuper = true)
@ToString(exclude = {"donation", "employees"})
public class DonationPayrollBatch extends AuditEntity {

    @OneToOne
    @JoinColumn(name = "donation_id", nullable = false, unique = true,
            foreignKey = @ForeignKey(name = "fk_payroll_batch_donation"))
    private Donation donation;

    @Column(nullable = false, length = 255)
    private String employer;

    @Column(name = "employer_match_routing", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EmployerMatchRouting employerMatchRouting = EmployerMatchRouting.PAYROLL_GIVING_TAGGED;

    /** The employer's own contribution, matching the employees' giving — separate from their money. */
    @Column(name = "match_amount", precision = 19, scale = 2)
    private BigDecimal matchAmount;

    /** Only meaningful when employerMatchRouting is CSR_ROUTED. */
    @Column(name = "csr_financial_year", length = 20)
    private String csrFinancialYear;

    @Column(name = "csr_project_ref", length = 255)
    private String csrProjectRef;

    @OneToMany(mappedBy = "batch", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DonationPayrollEmployee> employees = new ArrayList<>();
}
