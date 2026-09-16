package com.ngo.finance.paymentType.group.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a new payment type group
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentTypeGroupRequest {

    @NotBlank(message = "Group name is required")
    private String name;

    /** Defaults to active when omitted. */
    private Boolean status;
}
