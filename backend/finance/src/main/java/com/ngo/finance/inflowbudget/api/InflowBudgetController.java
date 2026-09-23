package com.ngo.finance.inflowbudget.api;

import com.ngo.finance.inflowbudget.dto.request.RecordInflowReceiptRequest;
import com.ngo.finance.inflowbudget.dto.response.InflowBudgetLineResponse;
import com.ngo.finance.inflowbudget.service.InflowBudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for the Inflow Budget — the donor tranche schedule read as
 * expected receipts, with actuals recorded against each line.
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/inflow-budget")
@Tag(name = "Inflow Budget", description = "Inflow Budget Management APIs")
public class InflowBudgetController {

    private final InflowBudgetService inflowBudgetService;

    @Autowired
    public InflowBudgetController(InflowBudgetService inflowBudgetService) {
        this.inflowBudgetService = inflowBudgetService;
    }

    @GetMapping
    @Operation(summary = "Get all Inflow Budget lines")
    public ResponseEntity<List<InflowBudgetLineResponse>> getAllLines() {
        log.info("GET /api/v1/inflow-budget - Fetching inflow budget lines");
        return ResponseEntity.ok(inflowBudgetService.getAllLines());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get an Inflow Budget line by ID")
    public ResponseEntity<InflowBudgetLineResponse> getLine(@PathVariable Long id) {
        log.info("GET /api/v1/inflow-budget/{} - Fetching inflow budget line", id);
        return ResponseEntity.ok(inflowBudgetService.getLineById(id));
    }

    @PostMapping("/{id}/receipt")
    @Operation(summary = "Record a receipt against an Inflow Budget line")
    public ResponseEntity<InflowBudgetLineResponse> recordReceipt(
            @PathVariable Long id,
            @Valid @RequestBody RecordInflowReceiptRequest request) {
        log.info("POST /api/v1/inflow-budget/{}/receipt - Recording receipt", id);
        return ResponseEntity.ok(inflowBudgetService.recordReceipt(id, request));
    }
}
