package com.ngo.finance.donor.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for approving a Grant Agreement.
 *
 * The backend has no authenticated identity yet (docs/BACKEND_GAPS.md #1), so
 * the approver is supplied by the client from the current session user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApproveGrantRequest {

    private Long approvedBy;

    private String remarks;
}
