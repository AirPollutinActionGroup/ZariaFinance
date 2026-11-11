package com.ngo.finance.fundsuggestion.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * New fund suggestion weights. Bonus weights are 0–100, the unrestricted
 * weight −100–0; at least one bonus must be above zero (checked in the service).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateFundSuggestionWeightsRequest {

    @NotNull(message = "Programme match points are required")
    @Min(value = 0, message = "Programme match points must be 0–100")
    @Max(value = 100, message = "Programme match points must be 0–100")
    private Integer programmeMatch;

    @NotNull(message = "Covers amount points are required")
    @Min(value = 0, message = "Covers amount points must be 0–100")
    @Max(value = 100, message = "Covers amount points must be 0–100")
    private Integer coversAmount;

    @NotNull(message = "Restricted for programme points are required")
    @Min(value = 0, message = "Restricted for programme points must be 0–100")
    @Max(value = 100, message = "Restricted for programme points must be 0–100")
    private Integer restrictedForProgramme;

    @NotNull(message = "Grant ending soon points are required")
    @Min(value = 0, message = "Grant ending soon points must be 0–100")
    @Max(value = 100, message = "Grant ending soon points must be 0–100")
    private Integer expiryMax;

    @NotNull(message = "Has grant points are required")
    @Min(value = 0, message = "Has grant points must be 0–100")
    @Max(value = 100, message = "Has grant points must be 0–100")
    private Integer hasGrant;

    @NotNull(message = "Unrestricted points are required")
    @Min(value = -100, message = "Unrestricted points must be −100–0")
    @Max(value = 0, message = "Unrestricted points must be −100–0")
    private Integer unrestricted;

    @NotNull(message = "Expiry window is required")
    @Min(value = 1, message = "Expiry window must be 1–730 days")
    @Max(value = 730, message = "Expiry window must be 1–730 days")
    private Integer expiryWindowDays;

    @NotBlank(message = "Give a reason for the change")
    @Size(max = 500)
    private String reason;

    @Size(max = 255)
    private String actor;
}
