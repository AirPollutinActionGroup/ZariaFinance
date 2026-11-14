package com.ngo.finance.masters.documenttype.api;

import com.ngo.finance.masters.documenttype.dto.DocumentTypeRequest;
import com.ngo.finance.masters.documenttype.dto.DocumentTypeResponse;
import com.ngo.finance.masters.documenttype.service.DocumentTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Document Type master — identity documents a donor can be identified by. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/document-types")
@Tag(name = "Document Type", description = "Document Type Master APIs")
public class DocumentTypeController {

    private final DocumentTypeService documentTypeService;

    @GetMapping
    @Operation(summary = "List document types (activeOnly=true for the donor form)")
    public ResponseEntity<List<DocumentTypeResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean activeOnly) {
        return ResponseEntity.ok(documentTypeService.list(search, activeOnly));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a document type")
    public ResponseEntity<DocumentTypeResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(documentTypeService.get(id));
    }

    @PostMapping
    @Operation(summary = "Create a document type")
    public ResponseEntity<DocumentTypeResponse> create(@Valid @RequestBody DocumentTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentTypeService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Rename a document type (its code never changes)")
    public ResponseEntity<DocumentTypeResponse> update(
            @PathVariable Long id, @Valid @RequestBody DocumentTypeRequest request) {
        return ResponseEntity.ok(documentTypeService.update(id, request));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a document type")
    public ResponseEntity<Void> activate(@PathVariable Long id) {
        documentTypeService.setActive(id, true);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a document type")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        documentTypeService.setActive(id, false);
        return ResponseEntity.noContent().build();
    }
}
