package com.ngo.finance.masters.budgetcategory.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a budget category. Only the name and description
 * can change; null fields are left as they are.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBudgetCategoryRequest {

    @Size(max = 255, message = "Category name must be at most 255 characters")
    private String name;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;
}
