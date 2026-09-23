package com.ngo.finance.masters.designation.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Designation master entity — a job title tied to a department, selectable
 * wherever an employee's designation is captured.
 */
@Entity
@Table(name = "designation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Designation extends AuditEntity {

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "department_id", nullable = false)
    private Long departmentId;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;
}
