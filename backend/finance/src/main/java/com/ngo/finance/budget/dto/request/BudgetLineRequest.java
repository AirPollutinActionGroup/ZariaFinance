package com.ngo.finance.budget.dto.request;

import com.ngo.finance.common.enums.ContributionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One budget line in a create/update request. Lines are replaced as a whole on
 * every save and numbered in the order sent; a blank quarter counts as zero.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetLineRequest {

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Description is required")
    @Size(max = 500, message = "Description must be at most 500 characters")
    private String description;

    @NotNull(message = "Book is required")
    private ContributionType book;

    @DecimalMin(value = "0", message = "Amounts cannot be negative")
    @Digits(integer = 16, fraction = 2, message = "Amount has too many digits")
    private BigDecimal q1;

    @DecimalMin(value = "0", message = "Amounts cannot be negative")
    @Digits(integer = 16, fraction = 2, message = "Amount has too many digits")
    private BigDecimal q2;

    @DecimalMin(value = "0", message = "Amounts cannot be negative")
    @Digits(integer = 16, fraction = 2, message = "Amount has too many digits")
    private BigDecimal q3;

    @DecimalMin(value = "0", message = "Amounts cannot be negative")
    @Digits(integer = 16, fraction = 2, message = "Amount has too many digits")
    private BigDecimal q4;
}
