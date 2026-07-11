package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.response.DashboardSummaryResponse;
import com.ngo.finance.donor.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for the dashboard summary.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Dashboard summary APIs")
public class DashboardController {

    private final DashboardService dashboardService;

    @Autowired
    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Donor-module position: counts + funding chain")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        log.info("GET /api/v1/dashboard/summary");
        return ResponseEntity.ok(dashboardService.getSummary());
    }
}
