package com.ngo.finance.paymentType.ledger.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a payment type ledger
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentTypeLedgerRequest {

    private String name;

    private Long groupId;
}
