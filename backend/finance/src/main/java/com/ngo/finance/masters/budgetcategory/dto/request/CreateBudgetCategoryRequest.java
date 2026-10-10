package com.ngo.finance.masters.budgetcategory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a new budget category
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBudgetCategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 255, message = "Category name must be at most 255 characters")
    private String name;

    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    /** Defaults to active when omitted. */
    private Boolean status;
}
