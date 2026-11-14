package com.ngo.finance.masters.documenttype.service;

import com.ngo.finance.common.exception.ResourceNotFoundException;
import com.ngo.finance.common.exception.ValidationException;
import com.ngo.finance.masters.documenttype.dto.DocumentTypeRequest;
import com.ngo.finance.masters.documenttype.dto.DocumentTypeResponse;
import com.ngo.finance.masters.documenttype.entity.DocumentTypeMaster;
import com.ngo.finance.masters.documenttype.repository.DocumentTypeMasterRepository;
import com.ngo.finance.common.enums.FundSourceDomicile;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Document Type master: the identity documents a donor can be identified by.
 * The code is fixed once created (donors store it); the name and status can change.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DocumentTypeService {

    private final DocumentTypeMasterRepository repository;

    @Transactional(readOnly = true)
    public List<DocumentTypeResponse> list(String search, boolean activeOnly) {
        List<DocumentTypeMaster> rows;
        if (search != null && !search.isBlank()) {
            rows = repository.search(search.trim());
        } else if (activeOnly) {
            rows = repository.findByStatusTrueOrderByNameAsc();
        } else {
            rows = repository.findAllByOrderByNameAsc();
        }
        return rows.stream()
                .filter(d -> !activeOnly || Boolean.TRUE.equals(d.getStatus()))
                .map(DocumentTypeResponse::of)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentTypeResponse get(Long id) {
        return DocumentTypeResponse.of(findOrThrow(id));
    }

    public DocumentTypeResponse create(DocumentTypeRequest request) {
        String name = request.getName().trim();
        String code = toCode(request.getCode() != null && !request.getCode().isBlank() ? request.getCode() : name);
        if (code.isEmpty()) {
            throw new ValidationException("Give a code made of letters or numbers");
        }
        if (repository.existsByCode(code)) {
            throw new ValidationException("A document type with code '" + code + "' already exists");
        }
        if (repository.existsByNameIgnoreCase(name)) {
            throw new ValidationException("A document type named '" + name + "' already exists");
        }
        DocumentTypeMaster saved = repository.save(DocumentTypeMaster.builder()
                .code(code)
                .name(name)
                .status(request.getStatus() == null || request.getStatus())
                .allowedFundSourceDomiciles(domicilesOf(request))
                .build());
        log.info("Document type {} ({}) created", saved.getCode(), saved.getName());
        return DocumentTypeResponse.of(saved);
    }

    /** Renames a document type; its code stays the same. */
    public DocumentTypeResponse update(Long id, DocumentTypeRequest request) {
        DocumentTypeMaster entity = findOrThrow(id);
        String name = request.getName().trim();
        if (!name.equalsIgnoreCase(entity.getName()) && repository.existsByNameIgnoreCase(name)) {
            throw new ValidationException("A document type named '" + name + "' already exists");
        }
        entity.setName(name);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        if (request.getAllowedFundSourceDomiciles() != null) {
            entity.getAllowedFundSourceDomiciles().clear();
            entity.getAllowedFundSourceDomiciles().addAll(request.getAllowedFundSourceDomiciles());
        }
        return DocumentTypeResponse.of(repository.save(entity));
    }

    public void setActive(Long id, boolean active) {
        DocumentTypeMaster entity = findOrThrow(id);
        entity.setStatus(active);
        repository.save(entity);
        log.info("Document type {} {}", entity.getCode(), active ? "activated" : "deactivated");
    }

    /**
     * Checks a donor's document type: null/blank is allowed (no document);
     * otherwise it must be a known code that applies to the donor's fund source
     * domicile. A new choice must also be active, but a donor may keep a type
     * that was deactivated (or narrowed) after it was saved.
     *
     * @return the normalised code, or null
     */
    @Transactional(readOnly = true)
    public String requireUsableCode(String code, String currentCode, FundSourceDomicile domicile) {
        if (code == null || code.isBlank()) {
            return null;
        }
        String normalised = code.trim();
        DocumentTypeMaster type = repository.findByCode(normalised)
                .orElseThrow(() -> new ValidationException("Unknown document type '" + normalised + "'"));
        boolean kept = normalised.equals(currentCode);
        if (!Boolean.TRUE.equals(type.getStatus()) && !kept) {
            throw new ValidationException("Document type '" + type.getName() + "' is not active");
        }
        if (!type.appliesTo(domicile) && !kept) {
            throw new ValidationException("Document type '" + type.getName() + "' is not used for "
                    + domicile.getLabel().toLowerCase(Locale.ROOT) + " donors");
        }
        return normalised;
    }

    private static Set<FundSourceDomicile> domicilesOf(DocumentTypeRequest request) {
        return request.getAllowedFundSourceDomiciles() == null
                ? new HashSet<>()
                : new HashSet<>(request.getAllowedFundSourceDomiciles());
    }

    /** "GST Number" → GST_NUMBER: upper case, non-alphanumerics become single underscores. */
    static String toCode(String text) {
        return text.trim()
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
    }

    private DocumentTypeMaster findOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Document type", id));
    }
}
