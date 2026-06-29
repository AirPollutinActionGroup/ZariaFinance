package com.ngo.finance.donor.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.donor.enums.DocumentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Grant Document entity - owned by GrantAgreement
 * Supports document versioning and soft-delete
 */
@Entity
@Table(name = "grant_document")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = "grant", callSuper = true)
@ToString(exclude = "grant")
public class GrantDocument extends AuditEntity {

    @ManyToOne
    @JoinColumn(name = "grant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_document_grant"))
    private GrantAgreement grant;

    @Column(nullable = false, length = 255)
    private String documentName;

    @Column(nullable = false, length = 100)
    @Enumerated(EnumType.STRING)
    private DocumentType documentType;

    @Column(nullable = false, length = 500)
    private String documentPath;

    @Column
    private Long fileSize;

    @Column(length = 100)
    private String mimeType;

    @Column(nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isCurrent = true;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime uploadDate = LocalDateTime.now();
}
