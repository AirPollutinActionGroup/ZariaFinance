package com.ngo.finance.transaction.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for a Transaction, with FK ids resolved to display names.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionResponse {

    private Long id;
    private String transactionCode;
    private String type;
    private String book;
    private LocalDate transactionDate;
    private String category;

    private String partyId;
    private String partyName;

    private Long donorId;
    private String donorName;

    private Long fundProfileId;
    private String fundProfileLabel;

    private Long grantId;
    private String grantCode;

    private BigDecimal amount;
    private String bankAccount;

    private Long paymentModeId;
    private String paymentModeName;

    private String reference;

    private Long groupId;
    private String groupName;

    private Long ledgerId;
    private String ledgerName;

    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
