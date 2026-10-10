package com.ngo.finance.outflow.api;

import com.ngo.finance.outflow.dto.response.OutflowRowResponse;
import com.ngo.finance.outflow.service.OutflowScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only outflow schedule, derived from APPROVED budgets (one row per
 * budget line per quarter with an amount).
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/outflow-budget")
@Tag(name = "Outflow Budget", description = "Outflow schedule derived from approved budgets")
public class OutflowBudgetController {

    private final OutflowScheduleService outflowScheduleService;

    @GetMapping
    @Operation(summary = "List outflow rows (optionally for one financial year, e.g. 2026-27)")
    public ResponseEntity<List<OutflowRowResponse>> listRows(@RequestParam(required = false) String financialYear) {
        return ResponseEntity.ok(outflowScheduleService.listRows(financialYear));
    }

    @GetMapping("/{rowId}")
    @Operation(summary = "Get one outflow row, e.g. BUD-2026-001-BL01-Q2")
    public ResponseEntity<OutflowRowResponse> getRow(@PathVariable String rowId) {
        return ResponseEntity.ok(outflowScheduleService.getRow(rowId));
    }
}
