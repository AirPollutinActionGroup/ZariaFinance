package com.ngo.finance.donor.dto.request;

import com.ngo.finance.donor.enums.FundClass;
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

    private String donorType;

    private FundClass fundClass;

    @Email(message = "Email must be valid")
    private String email;

    private String phoneNumber;

    private String website;

    private String registrationNumber;

    private String taxId;

    private String address;

    private Long cityId;

    private Long stateId;

    private String country;

    private String postalCode;
}
