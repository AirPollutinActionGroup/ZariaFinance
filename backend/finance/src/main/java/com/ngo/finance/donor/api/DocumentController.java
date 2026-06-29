package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.request.UploadDocumentRequest;
import com.ngo.finance.donor.dto.response.DocumentResponse;
import com.ngo.finance.donor.service.GrantDocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Grant Document operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/documents")
@Tag(name = "Documents", description = "Grant Document Management APIs")
public class DocumentController {

    @Autowired
    private GrantDocumentService documentService;

    @PostMapping
    @Operation(summary = "Upload a new document")
    public ResponseEntity<DocumentResponse> uploadDocument(@Valid @RequestBody UploadDocumentRequest request) {
        log.info("POST /api/v1/documents - Uploading new document");
        DocumentResponse response = documentService.uploadDocument(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document by ID")
    public ResponseEntity<DocumentResponse> getDocument(@PathVariable Long id) {
        log.info("GET /api/v1/documents/{} - Fetching document", id);
        DocumentResponse response = documentService.getDocumentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get documents for a grant")
    public ResponseEntity<List<DocumentResponse>> getDocuments(
            @RequestParam Long grantId,
            @RequestParam(required = false) String documentName) {
        log.info("GET /api/v1/documents - Fetching documents for grant id: {}", grantId);
        List<DocumentResponse> response;

        if (documentName != null && !documentName.isBlank()) {
            response = documentService.getDocumentVersions(grantId, documentName);
        } else {
            response = documentService.getDocumentsByGrantId(grantId);
        }

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a document")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        log.info("DELETE /api/v1/documents/{} - Deleting document", id);
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
