package com.ngo.finance.organizationRegister.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a new Organisation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrganizationRequest {

    @NotBlank(message = "Organisation name is required")
    private String name;

    @NotBlank(message = "Organisation short name is required")
    @Pattern(regexp = "^[a-z]+$", message = "Short name must be lowercase letters only (no numbers, spaces or special characters)")
    private String shortName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    private String webUrl;

    @NotBlank(message = "Address line 1 is required")
    private String address1;

    private String address2;

    @NotNull(message = "City is required")
    private Long cityId;

    @NotNull(message = "State is required")
    private Long stateId;

    @NotBlank(message = "Zip code is required")
    private String zipCode;
}
