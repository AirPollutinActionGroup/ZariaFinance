package com.ngo.finance.donation.dto.request;

import com.ngo.finance.donation.enums.GikIntendedUse;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Intended use is editable after receipt as a logged event with a reason. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGikIntendedUseRequest {

    @NotNull(message = "New intended use is required")
    private GikIntendedUse intendedUse;

    @NotBlank(message = "A reason is required for an intended-use change")
    private String reason;
}
