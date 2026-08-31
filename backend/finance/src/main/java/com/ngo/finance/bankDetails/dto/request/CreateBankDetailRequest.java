package com.ngo.finance.bankDetails.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a new bank account
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBankDetailRequest {

    @NotNull(message = "Book is required")
    @Pattern(regexp = "LC|FC", message = "Book must be LC or FC")
    private String book;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "Account number is required")
    @Pattern(regexp = "\\d{4,18}", message = "Account number must be 4-18 digits")
    private String accountNumber;

    @NotBlank(message = "IFSC code is required")
    @Pattern(regexp = "[A-Z]{4}0[A-Z0-9]{6}", message = "Enter a valid IFSC code")
    private String ifsc;

    @NotBlank(message = "Branch name is required")
    private String branchName;

    /** Defaults to active when omitted. */
    private Boolean status;
}
