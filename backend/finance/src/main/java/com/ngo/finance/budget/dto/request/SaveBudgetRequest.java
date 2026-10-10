package com.ngo.finance.budget.dto.request;

import com.ngo.finance.budget.enums.BudgetType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Create or update a budget (header + all lines). {@code submit} saves it
 * straight into Submitted; otherwise it is saved as Draft. {@code actor} is
 * the display name recorded in the approval history.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveBudgetRequest {

    @NotBlank(message = "Budget name is required")
    @Size(max = 255, message = "Budget name must be at most 255 characters")
    private String name;

    /** Financial Year master id. New budgets can't be placed in a closed year. */
    @NotNull(message = "Financial year is required")
    private Long financialYearId;

    @NotNull(message = "Budget type is required")
    private BudgetType budgetType;

    /** Required for PROGRAMME budgets; ignored for ORGANISATION ones. */
    private Long programmeId;

    /** Optional — null means all states. */
    private Long stateId;

    @Size(max = 255, message = "Owner must be at most 255 characters")
    private String owner;

    @Size(max = 1000, message = "Notes must be at most 1000 characters")
    private String notes;

    @NotEmpty(message = "Add at least one budget line")
    @Valid
    private List<BudgetLineRequest> lines;

    private Boolean submit;

    @Size(max = 255)
    private String actor;
}
