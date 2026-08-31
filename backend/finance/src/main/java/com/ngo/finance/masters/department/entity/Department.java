package com.ngo.finance.masters.department.entity;

import com.ngo.finance.common.entity.AuditEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Department master entity — organisational department used to classify
 * designations under Master Configuration.
 */
@Entity
@Table(name = "department")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Department extends AuditEntity {

    @Column(nullable = false, unique = true, length = 255)
    private String name;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;
}
