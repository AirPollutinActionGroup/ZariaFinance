package com.ngo.finance.common.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Base class for all audit-enabled entities.
 * Provides common audit fields: createdAt, updatedAt, createdBy, updatedBy
 */
@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditEntityOrg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    protected LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    protected LocalDateTime updatedAt;

    @Column(length = 255)
    protected String createdBy;

    @Column(length = 255)
    protected String updatedBy;

    @Column(name = "organization_id", nullable = false)
    protected Long organizationId;
}
