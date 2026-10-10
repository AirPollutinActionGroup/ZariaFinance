package com.ngo.finance.budget.api;

import com.ngo.finance.budget.dto.request.BudgetTransitionRequest;
import com.ngo.finance.budget.dto.request.SaveBudgetRequest;
import com.ngo.finance.budget.dto.response.BudgetResponse;
import com.ngo.finance.budget.enums.BudgetStatus;
import com.ngo.finance.budget.enums.BudgetType;
import com.ngo.finance.budget.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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
 * REST Controller for the Budget module: budgets, their lines and the
 * Draft → Submitted → Approved | Rejected workflow.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/budgets")
@Tag(name = "Budget", description = "Budget APIs")
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    @Operation(summary = "List budgets (optionally by financial year, status, type or search text)")
    public ResponseEntity<List<BudgetResponse>> listBudgets(
            @RequestParam(required = false) String financialYear,
            @RequestParam(required = false) BudgetStatus status,
            @RequestParam(required = false) BudgetType budgetType,
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/budgets - Listing budgets");
        return ResponseEntity.ok(budgetService.listBudgets(financialYear, status, budgetType, search));
    }

    @GetMapping("/category-usage")
    @Operation(summary = "Number of budget lines per budget category id")
    public ResponseEntity<Map<Long, Long>> getCategoryUsage() {
        return ResponseEntity.ok(budgetService.getCategoryUsage());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a budget with its lines and approval history")
    public ResponseEntity<BudgetResponse> getBudget(@PathVariable Long id) {
        log.info("GET /api/v1/budgets/{} - Fetching budget", id);
        return ResponseEntity.ok(budgetService.getBudget(id));
    }

    @PostMapping
    @Operation(summary = "Create a budget (as Draft, or Submitted when submit=true)")
    public ResponseEntity<BudgetResponse> createBudget(@Valid @RequestBody SaveBudgetRequest request) {
        log.info("POST /api/v1/budgets - Creating budget");
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetService.createBudget(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a Draft or Rejected budget (header and all lines)")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody SaveBudgetRequest request) {
        log.info("PUT /api/v1/budgets/{} - Updating budget", id);
        return ResponseEntity.ok(budgetService.updateBudget(id, request));
    }

    @PatchMapping("/{id}/submit")
    @Operation(summary = "Submit a draft for approval")
    public ResponseEntity<BudgetResponse> submitBudget(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) BudgetTransitionRequest request) {
        return ResponseEntity.ok(budgetService.submitBudget(id, request));
    }

    @PatchMapping("/{id}/withdraw")
    @Operation(summary = "Withdraw a submitted budget back to Draft")
    public ResponseEntity<BudgetResponse> withdrawBudget(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) BudgetTransitionRequest request) {
        return ResponseEntity.ok(budgetService.withdrawBudget(id, request));
    }

    @PatchMapping("/{id}/approve")
    @Operation(summary = "Approve a submitted budget")
    public ResponseEntity<BudgetResponse> approveBudget(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) BudgetTransitionRequest request) {
        return ResponseEntity.ok(budgetService.approveBudget(id, request));
    }

    @PatchMapping("/{id}/reject")
    @Operation(summary = "Return a submitted budget for revision (note required)")
    public ResponseEntity<BudgetResponse> rejectBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetTransitionRequest request) {
        return ResponseEntity.ok(budgetService.rejectBudget(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a draft budget")
    public ResponseEntity<Void> deleteBudget(@PathVariable Long id) {
        log.info("DELETE /api/v1/budgets/{} - Deleting budget", id);
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
