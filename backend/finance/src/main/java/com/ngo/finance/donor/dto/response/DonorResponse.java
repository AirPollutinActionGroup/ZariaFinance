package com.ngo.finance.donor.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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

    private String fundSourceDomicile;

    private Boolean fcraApplicable;

    private String foreignFundSourceType;

    private String foreignCountryId;

    private String panCardNumber;

    private String foreignTaxIdentifier;

    private String email;

    private String phoneNumber;

    private String website;

    private String spocNameOfThePerson;

    private String spocPhoneNumber;

    private String spocEmail;

    private String address;

    private String address2;

    private Long cityId;

    private String cityName;

    private Long stateId;

    private String stateName;

    private Long countryId;

    private String countryName;

    private String postalCode;

    private String registrationNumber;

    private Boolean isActive;

    private List<DonorContactResponse> contacts;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;
}
