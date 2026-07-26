package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest;
import com.ngo.finance.donor.dto.response.DisbursementScheduleResponse;
import com.ngo.finance.donor.service.DisbursementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
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
 * Disbursement rules for a grant agreement: schedule, tranches, release criteria
 * and reminders.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Disbursement", description = "Grant disbursement schedule, tranches and release criteria")
public class DisbursementController {

    private final DisbursementService disbursementService;

    @Autowired
    public DisbursementController(DisbursementService disbursementService) {
        this.disbursementService = disbursementService;
    }

    @GetMapping("/grants/{grantId}/disbursement")
    @Operation(summary = "Get a grant's disbursement configuration")
    public ResponseEntity<DisbursementScheduleResponse> getSchedule(@PathVariable Long grantId) {
        log.debug("GET /api/v1/grants/{}/disbursement", grantId);
        return ResponseEntity.ok(disbursementService.getSchedule(grantId));
    }

    @PutMapping("/grants/{grantId}/disbursement")
    @Operation(summary = "Replace a grant's disbursement configuration")
    public ResponseEntity<DisbursementScheduleResponse> saveSchedule(
            @PathVariable Long grantId,
            @Valid @RequestBody DisbursementScheduleRequest request) {
        log.info("PUT /api/v1/grants/{}/disbursement", grantId);
        return ResponseEntity.ok(disbursementService.saveSchedule(grantId, request));
    }

    @PostMapping("/grants/{grantId}/disbursement/finalise")
    @Operation(summary = "Finalise the plan — requires tranches to equal the total grant amount")
    public ResponseEntity<DisbursementScheduleResponse> finalise(@PathVariable Long grantId) {
        log.info("POST /api/v1/grants/{}/disbursement/finalise", grantId);
        return ResponseEntity.ok(disbursementService.finalise(grantId));
    }

    @PostMapping("/grants/{grantId}/disbursement/prefill")
    @Operation(summary = "Seed the tranche plan from the grant's fund profile")
    public ResponseEntity<DisbursementScheduleResponse> prefill(@PathVariable Long grantId) {
        log.info("POST /api/v1/grants/{}/disbursement/prefill", grantId);
        return ResponseEntity.ok(disbursementService.prefillFromFundProfile(grantId));
    }

    /**
     * Records that a release condition has been satisfied. {@code userId} is
     * supplied by the client from the session (docs/BACKEND_GAPS.md #1 — there is
     * no server-side authenticated identity yet).
     */
    @PatchMapping("/disbursement/criteria/{criterionId}/met")
    @Operation(summary = "Mark a release criterion as met")
    public ResponseEntity<DisbursementScheduleResponse> markCriterionMet(
            @PathVariable Long criterionId,
            @RequestParam(required = false) Long userId) {
        log.info("PATCH /api/v1/disbursement/criteria/{}/met", criterionId);
        return ResponseEntity.ok(disbursementService.markCriterionMet(criterionId, userId));
    }
}
