package com.ngo.finance.donor.api;

import com.ngo.finance.donor.dto.response.FcraRegisterEntry;
import com.ngo.finance.donor.dto.response.UtilisationComplianceEntry;
import com.ngo.finance.donor.service.ReportsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for donor-module reports (FCRA register, utilisation compliance).
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports", description = "Donor Module Reporting APIs")
public class ReportsController {

    private final ReportsService reportsService;

    @Autowired
    public ReportsController(ReportsService reportsService) {
        this.reportsService = reportsService;
    }

    @GetMapping("/fcra-register")
    @Operation(summary = "FCRA / foreign-contribution register")
    public ResponseEntity<List<FcraRegisterEntry>> getFcraRegister() {
        log.info("GET /api/v1/reports/fcra-register");
        return ResponseEntity.ok(reportsService.getFcraRegister());
    }

    @GetMapping("/utilisation-compliance")
    @Operation(summary = "Utilisation compliance against fund-profile caps")
    public ResponseEntity<List<UtilisationComplianceEntry>> getUtilisationCompliance() {
        log.info("GET /api/v1/reports/utilisation-compliance");
        return ResponseEntity.ok(reportsService.getUtilisationCompliance());
    }
}
