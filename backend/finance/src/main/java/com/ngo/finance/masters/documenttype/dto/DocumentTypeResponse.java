package com.ngo.finance.masters.documenttype.dto;

import com.ngo.finance.masters.documenttype.entity.DocumentTypeMaster;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** A document type as shown in Master Configuration and the donor form. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTypeResponse {

    private Long id;

    private String code;

    private String name;

    /** ACTIVE | INACTIVE, as on the other masters. */
    private String status;

    /** DOMESTIC / FOREIGN, sorted; empty = applies to both. */
    private List<String> allowedFundSourceDomiciles;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public static DocumentTypeResponse of(DocumentTypeMaster entity) {
        return DocumentTypeResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .status(Boolean.TRUE.equals(entity.getStatus()) ? "ACTIVE" : "INACTIVE")
                .allowedFundSourceDomiciles(entity.getAllowedFundSourceDomiciles().stream()
                        .map(Enum::name)
                        .sorted()
                        .toList())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
