package com.ngo.finance.outflow.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.outflow.dto.RefDto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A debit or credit note as returned by the API. {@code id} is the note code
 * (DN-2026-001 / CN-2026-001) — what the UI shows and links by. Credit-only
 * fields ({@code disbursementType}, {@code tranche}) are
 * omitted for debit notes.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NoteResponse {

    private String id;

    /** Numeric record id. */
    private Long recordId;

    /** Outflow row id (BUD-2026-001-BL01-Q2); debit notes only. */
    private String outflowLineId;

    private String budgetCode;

    private String lineCode;

    private Integer quarter;

    /** The budget line's description. */
    private String line;

    private LocalDate date;

    private BigDecimal amount;

    /** Debit notes only: why the line went over budget. */
    private String reason;

    private String book;

    /** Debit notes only. */
    private String payeeCategory;

    /** Debit notes only. */
    private RefDto payee;

    private RefDto paymentMode;

    private RefDto bankAccount;

    private RefDto group;

    private RefDto ledger;

    private RefDto donor;

    private RefDto fundProfile;

    private RefDto grant;

    private String disbursementType;

    private RefDto tranche;

    private String reference;

    private String remarks;

    private String attachmentName;

    private String createdBy;

    private LocalDateTime createdAt;
}
