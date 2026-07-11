package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.request.CreateTrancheRequest;
import com.ngo.finance.donor.dto.request.ReceiveTrancheRequest;
import com.ngo.finance.donor.dto.response.TrancheResponse;
import com.ngo.finance.donor.service.TrancheService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Grant Tranche operations. Tranches are listed / scheduled
 * under a grant ({@code /grants/{grantId}/tranches}); a receipt is recorded
 * against a single tranche ({@code /tranches/{id}/receive}).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Tranches", description = "Grant Tranche Management APIs")
public class TrancheController {

    private final TrancheService trancheService;

    @Autowired
    public TrancheController(TrancheService trancheService) {
        this.trancheService = trancheService;
    }

    @GetMapping("/grants/{grantId}/tranches")
    @Operation(summary = "List tranches for a grant")
    public ResponseEntity<List<TrancheResponse>> getTranches(@PathVariable Long grantId) {
        log.info("GET /api/v1/grants/{}/tranches", grantId);
        return ResponseEntity.ok(trancheService.getTranchesByGrant(grantId));
    }

    @PostMapping("/grants/{grantId}/tranches")
    @Operation(summary = "Schedule a tranche for a grant")
    public ResponseEntity<TrancheResponse> scheduleTranche(
            @PathVariable Long grantId,
            @Valid @RequestBody CreateTrancheRequest request) {
        log.info("POST /api/v1/grants/{}/tranches", grantId);
        TrancheResponse response = trancheService.scheduleTranche(grantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/tranches/{id}/receive")
    @Operation(summary = "Record an actual tranche receipt")
    public ResponseEntity<TrancheResponse> receiveTranche(
            @PathVariable Long id,
            @Valid @RequestBody ReceiveTrancheRequest request) {
        log.info("PATCH /api/v1/tranches/{}/receive", id);
        return ResponseEntity.ok(trancheService.receiveTranche(id, request));
    }
}
