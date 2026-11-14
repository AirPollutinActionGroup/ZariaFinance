package com.ngo.finance.employee.entity;

import com.ngo.finance.common.entity.AuditEntity;
import com.ngo.finance.employee.enums.EmployeeDocumentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * An uploaded identity document (PAN Card / Aadhaar Card) for one employee.
 * The file itself is kept in the {@code content} column; list screens read
 * {@link com.ngo.finance.employee.repository.EmployeeDocumentInfo} instead so
 * they never load the bytes.
 */
@Entity
@Table(name = "employee_document")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDocument extends AuditEntity {

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 20)
    private EmployeeDocumentType documentType;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private Long sizeBytes;

    @ToString.Exclude
    @Column(name = "content", nullable = false)
    private byte[] content;
}
