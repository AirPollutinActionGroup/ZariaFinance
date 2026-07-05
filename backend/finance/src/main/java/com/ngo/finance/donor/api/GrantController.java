package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.request.CreateGrantRequest;
import com.ngo.finance.donor.dto.response.GrantDetailsResponse;
import com.ngo.finance.donor.dto.response.GrantListResponse;
import com.ngo.finance.donor.service.GrantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
 * REST Controller for Grant Agreement operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/grants")
@Tag(name = "Grants", description = "Grant Agreement Management APIs")
public class GrantController {

    private final GrantService grantService;

    @Autowired
    public GrantController(GrantService grantService) {
        this.grantService = grantService;
    }

    @PostMapping
    @Operation(summary = "Create a new grant agreement")
    public ResponseEntity<GrantDetailsResponse> createGrant(@Valid @RequestBody CreateGrantRequest request) {
        log.info("POST /api/v1/grants - Creating new grant");
        GrantDetailsResponse response = grantService.createGrant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get grant by ID")
    public ResponseEntity<GrantDetailsResponse> getGrant(@PathVariable Long id) {
        log.info("GET /api/v1/grants/{} - Fetching grant", id);
        GrantDetailsResponse response = grantService.getGrantById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all grants or filter by donor/programme")
    public ResponseEntity<List<GrantListResponse>> getAllGrants(
            @RequestParam(required = false) Long donorId,
            @RequestParam(required = false) Long programmeId,
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/grants - Fetching grants");
        List<GrantListResponse> response;

        if (donorId != null) {
            response = grantService.getGrantsByDonorId(donorId);
        } else if (programmeId != null) {
            response = grantService.getGrantsByProgrammeId(programmeId);
        } else if (search != null && !search.isBlank()) {
            response = grantService.searchGrants(search);
        } else {
            response = grantService.getAllGrants();
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a grant agreement")
    public ResponseEntity<GrantDetailsResponse> updateGrant(
            @PathVariable Long id,
            @Valid @RequestBody CreateGrantRequest request) {
        log.info("PUT /api/v1/grants/{} - Updating grant", id);
        // Implementation would involve updating existing grant
        // For now, creating new grant with same ID would need merge logic
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Approve a grant agreement")
    public ResponseEntity<Void> approveGrant(@PathVariable Long id) {
        log.info("PATCH /api/v1/grants/{}/approve - Approving grant", id);
        grantService.approveGrant(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a grant agreement")
    public ResponseEntity<Void> activateGrant(@PathVariable Long id) {
        log.info("PATCH /api/v1/grants/{}/activate - Activating grant", id);
        grantService.activateGrant(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/close")
    @Operation(summary = "Close a grant agreement")
    public ResponseEntity<Void> closeGrant(@PathVariable Long id) {
        log.info("PATCH /api/v1/grants/{}/close - Closing grant", id);
        grantService.closeGrant(id);
        return ResponseEntity.noContent().build();
    }
}
