package com.ngo.finance.donor.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateProgrammeRequest {

    // Optional — auto-generated as the next PROG-NNN sequence when not supplied.
    @Size(max = 20, message = "Programme code must be at most 20 characters")
    private String programmeCode;

    @NotBlank(message = "Programme name is required")
    @Size(max = 255, message = "Programme name must be at most 255 characters")
    private String programmeName;

    private String description;

    private Boolean isActive;
}
