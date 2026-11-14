package com.ngo.finance.employee.repository;

import com.ngo.finance.employee.enums.EmployeeDocumentType;
import java.time.LocalDateTime;

/** Metadata of an employee document, without the file bytes. */
public interface EmployeeDocumentInfo {
    Long getEmployeeId();

    EmployeeDocumentType getDocumentType();

    String getFileName();

    String getContentType();

    Long getSizeBytes();

    LocalDateTime getUpdatedAt();
}
