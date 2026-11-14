package com.ngo.finance.donor.dto.request;

import com.ngo.finance.common.enums.ContributionType;
import com.ngo.finance.common.enums.FundSourceDomicile;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating a Donor
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDonorRequest {

    private String donorName;

    private Long donorTypeId;

    private FundSourceDomicile fundSourceDomicile;

    private Boolean fcraApplicable;

    private ContributionType book;

    private String foreignFundSourceType;

    private String foreignCountryId;

    private String passportId;

    /** Code of a Document Type master row (e.g. PAN_CARD). */
    private String documentType;

    private String documentNumber;

    @Email(message = "Email must be valid")
    private String email;

    private String phoneNumber;

    private String website;

    private String spocNameOfThePerson;

    private String spocPhoneNumber;

    @Email(message = "SPOC Email must be valid")
    private String spocEmail;

    private String address;

    private String address2;

    private Long cityId;

    private Long stateId;

    private Long countryId;

    private String postalCode;

    private String registrationNumber;

    private Boolean isActive;
}
