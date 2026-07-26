package com.ngo.finance.donor.dto.request;

import com.ngo.finance.donor.enums.GrantStatus;
import com.ngo.finance.donor.validator.annotation.ValidGrantDates;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating / updating a Grant Agreement.
 *
 * A grant inherits its donor, programme and fund class from its fund profile,
 * so only {@code fundProfileId} is supplied — donorId / programmeId / fundClass
 * are derived server-side, as is the total (Σ of the profile's tranche plan).
 * Foreign grants carry a currency and a locked FX rate; the INR reporting amount
 * is computed on the server.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ValidGrantDates
public class CreateGrantRequest {

    // Optional on create: auto-generated server-side (ZRY/GA/YYYY/NNN) when blank.
    // Immutable thereafter — ignored on update.
    private String grantCode;

    @NotNull(message = "Fund profile is required")
    private Long fundProfileId;

    // Optional: overrides the programme inherited from the fund profile. When null
    // the grant keeps the profile's programme (which may itself be null for untied funds).
    private Long programmeId;

    @NotBlank(message = "Agreement name is required")
    private String agreementName;

    @NotNull(message = "Agreement date is required")
    private LocalDate agreementDate;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    // Total grant amount is NOT accepted here: it is inherited as the sum of the
    // linked fund profile's tranche plan (agreement form section 2, read-only).

    @NotNull(message = "Status is required")
    private GrantStatus status; // ACTIVE | COMPLETED | CANCELLED

    private String grantCurrency; // defaults to INR server-side

    @PositiveOrZero(message = "FX locked rate must be zero or positive")
    private BigDecimal fxLockedRate; // defaults to 1 server-side

    private String description;

    private String agreementDocumentPath;

    // Section 3 (Approval). Independent of `status`: a grant can be ACTIVE with
    // approval still pending. Omitted on create → stays pending (2).
    @Min(value = 1, message = "Approval status must be between 1 and 4")
    @Max(value = 4, message = "Approval status must be between 1 and 4")
    private Integer approvalStatus; // 1 = approved, 2 = pending, 3 = on hold, 4 = completed

    private Long approvedBy;

    private LocalDate approvalDate;

    private String approvalRemarks;
}
