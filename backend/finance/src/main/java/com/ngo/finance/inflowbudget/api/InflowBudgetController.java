package com.ngo.finance.inflowbudget.api;

import com.ngo.finance.inflowbudget.dto.response.InflowBudgetLineResponse;
import com.ngo.finance.inflowbudget.service.InflowBudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for the Inflow Budget — the donor tranche schedule read as
 * expected receipts; what came in is the credit notes received against each line.
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
}
