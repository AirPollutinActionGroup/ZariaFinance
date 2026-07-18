package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donor.enums.DonorStatus;
import com.ngo.finance.donor.enums.FundClass;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Donor
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DonorResponse {

    private Long id;

    private String donorCode;

    private String donorName;

    private String donorType;

    private FundClass fundClass;

    private String email;

    private String phoneNumber;

    private String website;

    private String registrationNumber;

    private String taxId;

    private String donorSource;

    private String fundSourceDomicile;

    private Boolean fcraApplicable;

    private String foreignFundSourceType;

    private String foreignCountryName;

    private String panCardNumber;

    private String bankAccountRef;

    private String mouLink;

    private String address;

    private Long cityId;

    private String cityName;

    private Long stateId;

    private String stateName;

    private String country;

    private String postalCode;

    private DonorStatus status;

    private Integer onboardingStep;

    private Boolean isActive;

    private List<DonorContactResponse> contacts;

    /**
     * Register-only aggregates (issue #21). Populated for the donor list; left
     * null (and omitted) on the single-donor detail response.
     */
    // Distinct fund-profile restriction classes (A/B/C) held by this donor.
    private List<String> fundClassCodes;

    // Total committed (INR) across the donor's non-draft grant agreements.
    private BigDecimal totalCommitted;

    // Committed amount + fund-profile count split by restriction (Restricted / Unrestricted).
    private List<CommitmentBucket> commitmentBreakdown;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

    /** One restriction bucket of a donor's committed funding. */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommitmentBucket {
        private String fundMode;
        private BigDecimal committed;
        private Integer fundProfileCount;
    }
}
