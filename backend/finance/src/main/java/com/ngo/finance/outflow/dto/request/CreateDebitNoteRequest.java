package com.ngo.finance.outflow.dto.request;

import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.outflow.dto.RefDto;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Raise a debit (out) payment against an outflow row. A reason is required
 * when the note takes the row over budget; donor / fund / grant are optional,
 * but a fund profile needs its donor.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDebitNoteRequest {

    /** Outflow row id, e.g. BUD-2026-001-BL01-Q2. */
    @NotBlank(message = "Select the outflow line this debit note is for")
    private String outflowLineId;

    @NotNull(message = "Debit note date is required")
    private LocalDate date;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    @Digits(integer = 16, fraction = 2, message = "Amount has too many digits")
    private BigDecimal amount;

    @Size(max = 40)
    private String reason;

    @NotNull(message = "Select a book")
    private ContributionType book;

    @NotBlank(message = "Select the payee category")
    @Size(max = 20)
    private String payeeCategory;

    @NotNull(message = "Select the payee")
    private RefDto payee;

    @NotNull(message = "Select a payment mode")
    private RefDto paymentMode;

    private RefDto bankAccount;

    @NotNull(message = "Select a payment group")
    private RefDto group;

    private RefDto ledger;

    private RefDto donor;

    private RefDto fundProfile;

    private RefDto grant;

    @Size(max = 255)
    private String reference;

    @Size(max = 1000)
    private String remarks;

    /** File name only — the file itself isn't uploaded yet. */
    @Size(max = 255)
    private String attachmentName;

    @Size(max = 255)
    private String actor;
}
