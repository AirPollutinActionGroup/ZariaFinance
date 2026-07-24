package com.ngo.finance.donor.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for grant lifecycle transitions that only need a remark
 * (hold), as opposed to approve which also carries an approver id.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrantRemarksRequest {

    private String remarks;
}
