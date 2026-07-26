package com.ngo.finance.donor.dto.request;

import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.enums.FundSourceDomicile;
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

    private DonorType donorType;

    private FundSourceDomicile fundSourceDomicile;

    private Boolean fcraApplicable;

    private String foreignFundSourceType;

    private String foreignCountryId;

    private String panCardNumber;

    private String foreignTaxIdentifier;

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
