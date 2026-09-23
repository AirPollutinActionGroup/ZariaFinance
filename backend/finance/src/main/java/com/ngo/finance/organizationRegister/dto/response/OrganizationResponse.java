package com.ngo.finance.organizationRegister.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for Organisation Register
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrganizationResponse {

    private Long id;

    private String name;

    private String shortName;

    private String email;

    private String phone;

    private String webUrl;

    private String address1;

    private String address2;

    private Long cityId;

    private String cityName;

    private Long stateId;

    private String stateName;

    private String zipCode;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;
}
