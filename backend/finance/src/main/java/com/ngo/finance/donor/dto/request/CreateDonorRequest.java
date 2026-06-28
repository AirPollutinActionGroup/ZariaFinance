package com.ngo.finance.donor.dto.request;

import com.ngo.finance.donor.enums.FundClass;
import com.ngo.finance.donor.validator.annotation.UniqueDonorCode;
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

    @NotBlank(message = "Donor type is required")
    private String donorType;

    @NotNull(message = "Fund class is required")
    private FundClass fundClass;

    @NotBlank(message = "Email is required")
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
