package com.ngo.finance.donor.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for creating a Donor Contact
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDonorContactRequest {

    @NotNull(message = "Donor ID is required")
    private Long donorId;

    @NotBlank(message = "Contact name is required")
    private String contactName;

    private String contactTitle;

    @Email(message = "Email must be valid")
    private String email;

    private String phoneNumber;

    private String mobileNumber;

    private String address;

    private Long cityId;

    private Long stateId;

    private String postalCode;

    private String contactType;

    private Boolean isPrimary;
}
