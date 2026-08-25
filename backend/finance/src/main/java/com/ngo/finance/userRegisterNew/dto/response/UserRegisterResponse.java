package com.ngo.finance.userRegisterNew.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for the extended registration endpoint.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserRegisterResponse {

    private Long id;

    private String firstName;

    private String lastName;

    private String emailId;

    private String mobileNo;

    private String username;

    private Long roleId;

    private String roleName;

    /** Frontend permission tier (CEO / FINANCE_OFFICER / FUNDRAISING_LEAD) resolved from the role. */
    private String permissionRole;

    private Long organisationId;

    private String organisationName;

    private Boolean status;

    /** PENDING | APPROVED | REJECTED — derived from the entity's isApproved code. */
    private String approvalStatus;

    private Long approvedBy;

    private LocalDateTime createdAt;
}
