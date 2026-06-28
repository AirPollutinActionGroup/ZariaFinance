package com.ngo.finance.donor.dto.request;

import com.ngo.finance.donor.enums.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for uploading a document
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadDocumentRequest {

    @NotNull(message = "Grant ID is required")
    private Long grantId;

    @NotBlank(message = "Document name is required")
    private String documentName;

    @NotNull(message = "Document type is required")
    private DocumentType documentType;

    private String documentPath;
}
