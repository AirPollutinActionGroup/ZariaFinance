package com.ngo.finance.masters.donortype.api;

import com.ngo.finance.masters.donortype.dto.request.CreateDonorTypeRequest;
import com.ngo.finance.masters.donortype.dto.request.UpdateDonorTypeRequest;
import com.ngo.finance.masters.donortype.dto.response.DonorTypeResponse;
import com.ngo.finance.masters.donortype.service.DonorTypeService;
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
 * REST Controller for Donor Type master operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/donor-types")
@Tag(name = "Donor Type", description = "Donor Type Master APIs")
public class DonorTypeController {

    private final DonorTypeService donorTypeService;

    @PostMapping
    @Operation(summary = "Register a new donor type")
    public ResponseEntity<DonorTypeResponse> createDonorType(
            @Valid @RequestBody CreateDonorTypeRequest request) {
        log.info("POST /api/v1/donor-types - Registering new donor type");
        DonorTypeResponse response = donorTypeService.createDonorType(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get donor type by ID")
    public ResponseEntity<DonorTypeResponse> getDonorType(@PathVariable Long id) {
        log.info("GET /api/v1/donor-types/{} - Fetching donor type", id);
        return ResponseEntity.ok(donorTypeService.getDonorTypeById(id));
    }

    @GetMapping
    @Operation(summary = "Get all donor types")
    public ResponseEntity<List<DonorTypeResponse>> getAllDonorTypes(
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/donor-types - Fetching all donor types");
        List<DonorTypeResponse> response = (search != null && !search.isBlank())
                ? donorTypeService.searchDonorTypes(search)
                : donorTypeService.getAllDonorTypes();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a donor type")
    public ResponseEntity<DonorTypeResponse> updateDonorType(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDonorTypeRequest request) {
        log.info("PUT /api/v1/donor-types/{} - Updating donor type", id);
        return ResponseEntity.ok(donorTypeService.updateDonorType(id, request));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a donor type")
    public ResponseEntity<Void> activateDonorType(@PathVariable Long id) {
        log.info("PATCH /api/v1/donor-types/{}/activate - Activating donor type", id);
        donorTypeService.activateDonorType(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a donor type")
    public ResponseEntity<Void> deactivateDonorType(@PathVariable Long id) {
        log.info("PATCH /api/v1/donor-types/{}/deactivate - Deactivating donor type", id);
        donorTypeService.deactivateDonorType(id);
        return ResponseEntity.noContent().build();
    }
}
