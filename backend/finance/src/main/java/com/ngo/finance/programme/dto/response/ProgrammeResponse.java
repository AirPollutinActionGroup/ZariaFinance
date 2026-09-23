package com.ngo.finance.programme.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProgrammeResponse {

    private Long id;
    private String programmeCode;
    private String programmeName;
    private String description;
    private Boolean isActive;

    private String type;
    private Long parentProgrammeId;
    private String parentProgrammeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Long> stateIds;
    private List<String> stateNames;
    private List<Long> cityIds;
    private List<String> cityNames;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
