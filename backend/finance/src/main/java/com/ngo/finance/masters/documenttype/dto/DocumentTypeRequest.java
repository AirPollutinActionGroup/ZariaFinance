package com.ngo.finance.masters.documenttype.dto;

import com.ngo.finance.common.enums.FundSourceDomicile;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Create / update a document type. On create a blank code is derived from the
 * name (e.g. "GST Number" → GST_NUMBER); on update the code is ignored — it
 * never changes because donors store it.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTypeRequest {

    @NotBlank(message = "Document type name is required")
    @Size(max = 255, message = "Name can be at most 255 characters")
    private String name;

    @Size(max = 50, message = "Code can be at most 50 characters")
    private String code;

    /** Defaults to active when omitted on create. */
    private Boolean status;

    /** Domiciles the type applies to; null/empty = both. On update, null leaves them unchanged. */
    private Set<FundSourceDomicile> allowedFundSourceDomiciles;
}
