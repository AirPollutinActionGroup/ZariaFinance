package com.ngo.finance.masters.budgetcategory.api;

import com.ngo.finance.masters.budgetcategory.dto.request.CreateBudgetCategoryRequest;
import com.ngo.finance.masters.budgetcategory.dto.request.UpdateBudgetCategoryRequest;
import com.ngo.finance.masters.budgetcategory.dto.response.BudgetCategoryResponse;
import com.ngo.finance.masters.budgetcategory.service.BudgetCategoryService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for Budget Category master operations
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/budget-categories")
@Tag(name = "Budget Category", description = "Budget Category Master APIs")
public class BudgetCategoryController {

    private final BudgetCategoryService budgetCategoryService;

    @PostMapping
    @Operation(summary = "Register a new budget category")
    public ResponseEntity<BudgetCategoryResponse> createBudgetCategory(
            @Valid @RequestBody CreateBudgetCategoryRequest request) {
        log.info("POST /api/v1/budget-categories - Registering new budget category");
        BudgetCategoryResponse response = budgetCategoryService.createBudgetCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get budget category by ID")
    public ResponseEntity<BudgetCategoryResponse> getBudgetCategory(@PathVariable Long id) {
        log.info("GET /api/v1/budget-categories/{} - Fetching budget category", id);
        return ResponseEntity.ok(budgetCategoryService.getBudgetCategoryById(id));
    }

    @GetMapping
    @Operation(summary = "Get all budget categories (optionally filtered by name)")
    public ResponseEntity<List<BudgetCategoryResponse>> getAllBudgetCategories(
            @RequestParam(required = false) String search) {
        log.info("GET /api/v1/budget-categories - Fetching budget categories");
        List<BudgetCategoryResponse> response = (search != null && !search.isBlank())
                ? budgetCategoryService.searchBudgetCategories(search)
                : budgetCategoryService.getAllBudgetCategories();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a budget category's name or description")
    public ResponseEntity<BudgetCategoryResponse> updateBudgetCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBudgetCategoryRequest request) {
        log.info("PUT /api/v1/budget-categories/{} - Updating budget category", id);
        return ResponseEntity.ok(budgetCategoryService.updateBudgetCategory(id, request));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a budget category")
    public ResponseEntity<Void> activateBudgetCategory(@PathVariable Long id) {
        log.info("PATCH /api/v1/budget-categories/{}/activate - Activating budget category", id);
        budgetCategoryService.activateBudgetCategory(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a budget category")
    public ResponseEntity<Void> deactivateBudgetCategory(@PathVariable Long id) {
        log.info("PATCH /api/v1/budget-categories/{}/deactivate - Deactivating budget category", id);
        budgetCategoryService.deactivateBudgetCategory(id);
        return ResponseEntity.noContent().build();
    }
}
