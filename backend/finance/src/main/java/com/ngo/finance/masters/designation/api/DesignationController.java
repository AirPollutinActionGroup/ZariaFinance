package com.ngo.finance.masters.designation.api;

import com.ngo.finance.masters.designation.dto.request.CreateDesignationRequest;
import com.ngo.finance.masters.designation.dto.request.UpdateDesignationRequest;
import com.ngo.finance.masters.designation.dto.response.DesignationResponse;
import com.ngo.finance.masters.designation.service.DesignationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

/**
 * REST Controller for Designation master operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/designations")
@Tag(name = "Designation", description = "Designation Master APIs")
public class DesignationController {

    private final DesignationService designationService;

    @PostMapping
    @Operation(summary = "Register a new designation")
    public ResponseEntity<DesignationResponse> createDesignation(
            @Valid @RequestBody CreateDesignationRequest request) {
        log.info("POST /api/v1/designations - Registering new designation");
        DesignationResponse response = designationService.createDesignation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get designation by ID")
    public ResponseEntity<DesignationResponse> getDesignation(@PathVariable Long id) {
        log.info("GET /api/v1/designations/{} - Fetching designation", id);
        return ResponseEntity.ok(designationService.getDesignationById(id));
    }

    @GetMapping
    @Operation(summary = "Get all designations")
    public ResponseEntity<List<DesignationResponse>> getAllDesignations(
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/designations - Fetching all designations");
        List<DesignationResponse> response = (search != null && !search.isBlank())
                ? designationService.searchDesignations(search)
                : designationService.getAllDesignations();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a designation")
    public ResponseEntity<DesignationResponse> updateDesignation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDesignationRequest request) {
        log.info("PUT /api/v1/designations/{} - Updating designation", id);
        return ResponseEntity.ok(designationService.updateDesignation(id, request));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a designation")
    public ResponseEntity<Void> activateDesignation(@PathVariable Long id) {
        log.info("PATCH /api/v1/designations/{}/activate - Activating designation", id);
        designationService.activateDesignation(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a designation")
    public ResponseEntity<Void> deactivateDesignation(@PathVariable Long id) {
        log.info("PATCH /api/v1/designations/{}/deactivate - Deactivating designation", id);
        designationService.deactivateDesignation(id);
        return ResponseEntity.noContent().build();
    }
}
