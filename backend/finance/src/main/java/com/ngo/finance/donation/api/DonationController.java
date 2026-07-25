package com.ngo.finance.donation.api;

import com.ngo.finance.donation.dto.request.CreateDonationRequest;
import com.ngo.finance.donation.dto.request.UpdateGikIntendedUseRequest;
import com.ngo.finance.donation.dto.response.DonationDetailResponse;
import com.ngo.finance.donation.dto.response.DonationListResponse;
import com.ngo.finance.donation.service.DonationService;
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
 * REST Controller for Donation operations. A donation is income the moment
 * it lands — there is no committed/approve/activate lifecycle like grants.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/donations")
@Tag(name = "Donations", description = "Donation (gift received) management APIs")
public class DonationController {

    private final DonationService donationService;

    @Autowired
    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping
    @Operation(summary = "Record a new donation")
    public ResponseEntity<DonationDetailResponse> createDonation(@Valid @RequestBody CreateDonationRequest request) {
        log.info("POST /api/v1/donations - Creating new donation");
        DonationDetailResponse response = donationService.createDonation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get donation by ID")
    public ResponseEntity<DonationDetailResponse> getDonation(@PathVariable Long id) {
        log.info("GET /api/v1/donations/{} - Fetching donation", id);
        return ResponseEntity.ok(donationService.getDonationById(id));
    }

    @GetMapping
    @Operation(summary = "Get all donations, or filter by donor / compliance state / search")
    public ResponseEntity<List<DonationListResponse>> getAllDonations(
            @RequestParam(required = false) Long donorId,
            @RequestParam(required = false) String complianceState,
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/donations - Fetching donations");
        List<DonationListResponse> response;

        if (donorId != null) {
            response = donationService.getDonationsByDonorId(donorId);
        } else if (complianceState != null && !complianceState.isBlank()) {
            response = donationService.getDonationsByComplianceState(complianceState);
        } else if (search != null && !search.isBlank()) {
            response = donationService.searchDonations(search);
        } else {
            response = donationService.getAllDonations();
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a donation")
    public ResponseEntity<DonationDetailResponse> updateDonation(
            @PathVariable Long id,
            @Valid @RequestBody CreateDonationRequest request) {
        log.info("PUT /api/v1/donations/{} - Updating donation", id);
        return ResponseEntity.ok(donationService.updateDonation(id, request));
    }

    @PatchMapping("/{donationId}/gik-items/{gikItemId}/intended-use")
    @Operation(summary = "Change a gift-in-kind line item's intended use (logged)")
    public ResponseEntity<DonationDetailResponse> updateGikIntendedUse(
            @PathVariable Long donationId,
            @PathVariable Long gikItemId,
            @Valid @RequestBody UpdateGikIntendedUseRequest request) {
        log.info("PATCH /api/v1/donations/{}/gik-items/{}/intended-use", donationId, gikItemId);
        return ResponseEntity.ok(donationService.updateGikIntendedUse(donationId, gikItemId, request));
    }

    @PatchMapping("/{id}/issue-80g-receipt")
    @Operation(summary = "Issue the 80G receipt for an eligible donation")
    public ResponseEntity<DonationDetailResponse> issueEightyGReceipt(@PathVariable Long id) {
        log.info("PATCH /api/v1/donations/{}/issue-80g-receipt", id);
        return ResponseEntity.ok(donationService.issueEightyGReceipt(id));
    }

    @PatchMapping("/{id}/10bd-filing")
    @Operation(summary = "Advance the Form 10BD/10BE filing state for a reportable donation")
    public ResponseEntity<DonationDetailResponse> markTenBdFiling(@PathVariable Long id) {
        log.info("PATCH /api/v1/donations/{}/10bd-filing", id);
        return ResponseEntity.ok(donationService.markTenBdFiling(id));
    }
}
