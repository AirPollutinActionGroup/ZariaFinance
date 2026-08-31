package com.ngo.finance.paymentMode.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for registering a new payment mode
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentModeRequest {

    @NotBlank(message = "Payment mode name is required")
    private String name;

    /** Defaults to active when omitted. */
    private Boolean status;
}
