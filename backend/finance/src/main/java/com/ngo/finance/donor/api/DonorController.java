package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.request.CreateDonorRequest;
import com.ngo.finance.donor.dto.request.UpdateDonorRequest;
import com.ngo.finance.donor.dto.response.DonorResponse;
import com.ngo.finance.donor.service.DonorService;
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
 * REST Controller for Donor operations
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/donors")
@Tag(name = "Donors", description = "Donor Master Management APIs")
public class DonorController {

    @Autowired
    private DonorService donorService;

    @PostMapping
    @Operation(summary = "Create a new donor")
    public ResponseEntity<DonorResponse> createDonor(@Valid @RequestBody CreateDonorRequest request) {
        log.info("POST /api/v1/donors - Creating new donor");
        DonorResponse response = donorService.createDonor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get donor by ID")
    public ResponseEntity<DonorResponse> getDonor(@PathVariable Long id) {
        log.info("GET /api/v1/donors/{} - Fetching donor", id);
        DonorResponse response = donorService.getDonorById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all donors")
    public ResponseEntity<List<DonorResponse>> getAllDonors(
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/donors - Fetching all donors");
        List<DonorResponse> response;
        if (search != null && !search.isBlank()) {
            response = donorService.searchDonors(search);
        } else {
            response = donorService.getAllDonors();
        }
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a donor")
    public ResponseEntity<DonorResponse> updateDonor(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDonorRequest request) {
        log.info("PUT /api/v1/donors/{} - Updating donor", id);
        DonorResponse response = donorService.updateDonor(id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a donor")
    public ResponseEntity<Void> activateDonor(@PathVariable Long id) {
        log.info("PATCH /api/v1/donors/{}/activate - Activating donor", id);
        donorService.activateDonor(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a donor")
    public ResponseEntity<Void> deactivateDonor(@PathVariable Long id) {
        log.info("PATCH /api/v1/donors/{}/deactivate - Deactivating donor", id);
        donorService.deactivateDonor(id);
        return ResponseEntity.noContent().build();
    }
}
