package com.ngo.finance.bankDetails.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a bank account. All fields optional (partial update).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBankDetailRequest {

    @Pattern(regexp = "LC|FC", message = "Book must be LC or FC")
    private String book;

    private String bankName;

    @Pattern(regexp = "\\d{4,18}", message = "Account number must be 4-18 digits")
    private String accountNumber;

    @Pattern(regexp = "[A-Z]{4}0[A-Z0-9]{6}", message = "Enter a valid IFSC code")
    private String ifsc;

    private String branchName;
}
