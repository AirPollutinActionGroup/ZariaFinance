package com.ngo.finance.employee.dto.response;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** One uploaded employee document — metadata only. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDocumentResponse {

    /** PAN_CARD | AADHAAR_CARD */
    private String type;

    /** "PAN Card" | "Aadhaar Card" */
    private String label;

    private String fileName;

    private String contentType;

    private Long sizeBytes;

    private LocalDateTime uploadedAt;
}
