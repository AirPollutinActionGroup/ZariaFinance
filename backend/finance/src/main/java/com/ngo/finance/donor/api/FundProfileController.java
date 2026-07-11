package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.request.CreateFundProfileRequest;
import com.ngo.finance.donor.dto.response.FundProfileResponse;
import com.ngo.finance.donor.service.FundProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Donor Fund Profile operations.
 *
 * Profiles are created and listed under a donor
 * ({@code /donors/{donorId}/fund-profiles}); a single profile is addressed
 * directly ({@code /fund-profiles/{id}}).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Fund Profiles", description = "Donor Fund Profile Management APIs")
public class FundProfileController {

    private final FundProfileService fundProfileService;

    @Autowired
    public FundProfileController(FundProfileService fundProfileService) {
        this.fundProfileService = fundProfileService;
    }

    @PostMapping("/donors/{donorId}/fund-profiles")
    @Operation(summary = "Create a fund profile for a donor")
    public ResponseEntity<FundProfileResponse> createProfile(
            @PathVariable Long donorId,
            @Valid @RequestBody CreateFundProfileRequest request) {
        log.info("POST /api/v1/donors/{}/fund-profiles - Creating fund profile", donorId);
        FundProfileResponse response = fundProfileService.createProfile(donorId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/donors/{donorId}/fund-profiles")
    @Operation(summary = "List fund profiles for a donor")
    public ResponseEntity<List<FundProfileResponse>> getProfilesByDonor(@PathVariable Long donorId) {
        log.info("GET /api/v1/donors/{}/fund-profiles - Listing fund profiles", donorId);
        return ResponseEntity.ok(fundProfileService.getProfilesByDonor(donorId));
    }

    @GetMapping("/fund-profiles/{id}")
    @Operation(summary = "Get a fund profile by ID")
    public ResponseEntity<FundProfileResponse> getProfile(@PathVariable Long id) {
        log.info("GET /api/v1/fund-profiles/{} - Fetching fund profile", id);
        return ResponseEntity.ok(fundProfileService.getProfileById(id));
    }

    @PutMapping("/fund-profiles/{id}")
    @Operation(summary = "Update a fund profile")
    public ResponseEntity<FundProfileResponse> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody CreateFundProfileRequest request) {
        log.info("PUT /api/v1/fund-profiles/{} - Updating fund profile", id);
        return ResponseEntity.ok(fundProfileService.updateProfile(id, request));
    }
}
