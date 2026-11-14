package com.ngo.finance.employee.repository;

import com.ngo.finance.employee.entity.EmployeeDocument;
import com.ngo.finance.employee.enums.EmployeeDocumentType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {

    Optional<EmployeeDocument> findByEmployeeIdAndDocumentType(Long employeeId, EmployeeDocumentType documentType);

    /** Metadata only (no file bytes) for the given employees, in a fixed order. */
    @Query("""
            SELECT d.employeeId AS employeeId, d.documentType AS documentType, d.fileName AS fileName,
                   d.contentType AS contentType, d.sizeBytes AS sizeBytes, d.updatedAt AS updatedAt
            FROM EmployeeDocument d
            WHERE d.employeeId IN :employeeIds
            ORDER BY d.employeeId, d.documentType
            """)
    List<EmployeeDocumentInfo> findInfoByEmployeeIds(List<Long> employeeIds);
}
