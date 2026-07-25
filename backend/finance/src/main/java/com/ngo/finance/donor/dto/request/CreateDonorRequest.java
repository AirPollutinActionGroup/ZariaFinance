package com.ngo.finance.donor.dto.request;

import com.ngo.finance.donor.enums.DonorType;
import com.ngo.finance.donor.enums.FundSourceDomicile;
import com.ngo.finance.donor.validator.annotation.UniqueDonorCode;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a new Donor
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDonorRequest {

    @NotBlank(message = "Donor code is required")
    @UniqueDonorCode
    private String donorCode;

    @NotBlank(message = "Donor name is required")
    private String donorName;

    @NotNull(message = "Donor type is required")
    @Enumerated(EnumType.STRING)
    private DonorType donorType;

    @NotNull(message = "Fund source domicile is required")
    @Enumerated(EnumType.STRING)
    private FundSourceDomicile fundSourceDomicile;

    @Builder.Default
    private Boolean fcraApplicable = false;

    private String foreignFundSourceType;

    private String foreignCountryId;
    private String panCardNumber;
    private String foreignTaxIdentifier;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String phoneNumber;

    private String website;

    @NotBlank(message = "SPOC Name is required")
    private String spocNameOfThePerson;

    @Column(nullable = true, length = 255)
    private String spocPhoneNumber;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "SPOC Email is required")
    @Email(message = "SPOC Email must be valid")
    private String spocEmail;

    private String address;
    private String address2;

    private Long cityId;

    private Long stateId;

    private Long countryId;

    private String postalCode;

    private String registrationNumber; // Registration/Incorporation Number – The donor's registration or incorporation
                                       // number in its home country. This field is applicable only for organisations
                                       // (e.g., companies or foundations) and not for individual donors.
    @Builder.Default
    private Boolean isActive = true;

}
