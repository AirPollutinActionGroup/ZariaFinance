package com.ngo.finance.transaction.dto.request;

import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.common.enums.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for recording a new transaction (the "New Transaction" form).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTransactionRequest {

    @NotNull(message = "Type is required")
    private TransactionType type;

    @NotNull(message = "Book is required")
    private ContributionType book;

    @NotNull(message = "Date is required")
    private LocalDate transactionDate;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Party is required")
    private String partyId;

    @NotBlank(message = "Party name is required")
    private String partyName;

    @NotNull(message = "Donor is required")
    private Long donorId;

    @NotNull(message = "Fund profile is required")
    private Long fundProfileId;

    /** Optional — an untied disbursement may have no grant agreement. */
    private Long grantId;

    /** Optional — set on a CREDIT to receipt it against a tranched Inflow Budget line. */
    private Long inflowBudgetLineId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;

    /** Optional — the statutory bank account (Bank Details master) this receipt/payment moved through. */
    private Long bankAccountId;

    @NotNull(message = "Payment mode is required")
    private Long paymentModeId;

    private String reference;

    @NotNull(message = "Group is required")
    private Long groupId;

    @NotNull(message = "Ledger is required")
    private Long ledgerId;

    private String notes;
}
