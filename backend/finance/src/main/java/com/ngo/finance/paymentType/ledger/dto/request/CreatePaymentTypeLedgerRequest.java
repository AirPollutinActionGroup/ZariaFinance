package com.ngo.finance.paymentType.ledger.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a new payment type ledger
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentTypeLedgerRequest {

    @NotBlank(message = "Ledger name is required")
    private String name;

    @NotNull(message = "Group is required")
    private Long groupId;

    /** Defaults to active when omitted. */
    private Boolean status;
}
