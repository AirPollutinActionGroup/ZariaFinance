package com.ngo.finance.employee.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Employee master entity — department and state map to F4 cost centres;
 * bucket determines which F3 ledger the employee's cost posts to (Project
 * buckets additionally carry a primary programme).
 */
@Entity
@Table(name = "employee")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee extends AuditEntity {

    @Column(name = "emp_id", nullable = false, unique = true, length = 20)
    private String empId;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(name = "designation_id", nullable = false)
    private Long designationId;

    @Column(nullable = false, length = 20)
    private String bucket;

    @Column(name = "primary_programme_id")
    private Long primaryProgrammeId;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(name = "annual_ctc", nullable = false, precision = 15, scale = 2)
    private BigDecimal annualCtc;

    @Column(name = "employment_type", nullable = false, length = 20)
    private String employmentType;

    @Column(nullable = false, length = 3)
    private String pf;

    @Column(nullable = false, length = 3)
    private String esi;

    @Column(nullable = false, length = 3)
    private String gratuity;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;
}
