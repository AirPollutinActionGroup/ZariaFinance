package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.ngo.finance.donor.enums.DonorStatus;
import com.ngo.finance.donor.enums.FundClass;
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

    private String address;

    private String country;

    private String postalCode;

    private DonorStatus status;

    private Integer onboardingStep;

    private Boolean isActive;

    private List<DonorContactResponse> contacts;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;
}
