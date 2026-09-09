package com.ngo.finance.employee.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One immutable row per field changed on an employee — createdAt/createdBy
 * (from AuditEntity) double as "changed at" / "changed by" since a log row
 * is written once and never updated.
 */
@Entity
@Table(name = "employee_update_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeUpdateLog extends AuditEntity {

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "field_name", nullable = false, length = 50)
    private String fieldName;

    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;
}
