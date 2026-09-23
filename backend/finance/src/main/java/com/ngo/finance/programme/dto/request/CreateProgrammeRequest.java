package com.ngo.finance.programme.dto.request;

import com.ngo.finance.programme.ProgrammeStatuses;
import com.ngo.finance.programme.ProgrammeTypes;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
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

    /** Defaults to "Programme" when omitted. */
    @Pattern(regexp = ProgrammeTypes.PATTERN, message = "Type is not a recognised value")
    private String type;

    /** Required only when type is "Project" — enforced in the service layer. */
    private Long parentProgrammeId;

    private LocalDate startDate;

    private LocalDate endDate;

    private List<Long> stateIds;

    private List<Long> cityIds;

    /** Defaults to "Active" when omitted; isActive is derived from this if not explicitly given. */
    @Pattern(regexp = ProgrammeStatuses.PATTERN, message = "Status is not a recognised value")
    private String status;

    private Boolean isActive;
}
