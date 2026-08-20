package com.ngo.finance.organizationRegister.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating an Organisation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrganizationRequest {

    private String name;

    @Pattern(regexp = "^[a-z]+$", message = "Short name must be lowercase letters only (no numbers, spaces or special characters)")
    private String shortName;

    @Email(message = "Email must be valid")
    private String email;

    private String phone;

    private String webUrl;

    private String address1;

    private String address2;

    private Long cityId;

    private Long stateId;

    private String zipCode;
}
