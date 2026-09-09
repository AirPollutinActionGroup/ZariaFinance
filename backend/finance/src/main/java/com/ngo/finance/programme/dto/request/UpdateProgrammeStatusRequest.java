package com.ngo.finance.programme.dto.request;

import com.ngo.finance.programme.ProgrammeStatuses;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProgrammeStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = ProgrammeStatuses.PATTERN, message = "Status is not a recognised value")
    private String status;
}
