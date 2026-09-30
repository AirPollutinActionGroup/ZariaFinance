package com.ngo.finance.budget.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Optional body for submit / withdraw / approve / reject. A note is required
 * when rejecting, so the owner knows what to change.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetTransitionRequest {

    @Size(max = 1000, message = "Note must be at most 1000 characters")
    private String note;

    @Size(max = 255)
    private String actor;
}
