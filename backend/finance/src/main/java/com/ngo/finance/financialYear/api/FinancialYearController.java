package com.ngo.finance.financialYear.api;

import com.ngo.finance.financialYear.dto.request.CreateFinancialYearRequest;
import com.ngo.finance.financialYear.dto.request.UpdateFinancialYearRequest;
import com.ngo.finance.financialYear.dto.response.FinancialYearResponse;
import com.ngo.finance.financialYear.service.FinancialYearService;
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
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Financial Year master operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/financial-years")
@Tag(name = "Financial Year", description = "Financial Year Master APIs")
public class FinancialYearController {

    private final FinancialYearService financialYearService;

    @PostMapping
    @Operation(summary = "Create a new financial year")
    public ResponseEntity<FinancialYearResponse> createFinancialYear(
            @Valid @RequestBody CreateFinancialYearRequest request) {
        log.info("POST /api/v1/financial-years - Creating new financial year");
        FinancialYearResponse response = financialYearService.createFinancialYear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get financial year by ID")
    public ResponseEntity<FinancialYearResponse> getFinancialYear(@PathVariable Long id) {
        log.info("GET /api/v1/financial-years/{} - Fetching financial year", id);
        return ResponseEntity.ok(financialYearService.getFinancialYearById(id));
    }

    @GetMapping
    @Operation(summary = "Get all financial years")
    public ResponseEntity<List<FinancialYearResponse>> getAllFinancialYears() {
        log.info("GET /api/v1/financial-years - Fetching all financial years");
        return ResponseEntity.ok(financialYearService.getAllFinancialYears());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a financial year")
    public ResponseEntity<FinancialYearResponse> updateFinancialYear(
            @PathVariable Long id,
            @Valid @RequestBody UpdateFinancialYearRequest request) {
        log.info("PUT /api/v1/financial-years/{} - Updating financial year", id);
        return ResponseEntity.ok(financialYearService.updateFinancialYear(id, request));
    }

    @PatchMapping("/{id}/set-current")
    @Operation(summary = "Set a financial year as the current one")
    public ResponseEntity<Void> setCurrentFinancialYear(@PathVariable Long id) {
        log.info("PATCH /api/v1/financial-years/{}/set-current - Setting current financial year", id);
        financialYearService.setCurrentFinancialYear(id);
        return ResponseEntity.noContent().build();
    }
}
