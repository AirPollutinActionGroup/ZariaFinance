package com.ngo.finance.donor.service;

import com.ngo.finance.donor.dto.request.DisbursementScheduleRequest;
import com.ngo.finance.donor.dto.response.DisbursementScheduleResponse;

/**
 * The disbursement configuration of a grant (Disbursement Rules): schedule,
 * tranches, release criteria and reminders.
 */
public interface DisbursementService {

    /**
     * The grant's configuration, or a not-yet-configured shell (type null, no
     * tranches) carrying the committed total so the form can open on a new grant.
     */
    DisbursementScheduleResponse getSchedule(Long grantId);

    /**
     * Replace the whole configuration. Existing tranches are matched by id so
     * recorded receipts survive; removing or re-pricing a received tranche is
     * rejected rather than silently losing money that has arrived.
     */
    DisbursementScheduleResponse saveSchedule(Long grantId, DisbursementScheduleRequest request);

    /**
     * Mark the plan complete. Requires Σ tranche amounts to equal the grant's
     * total grant amount.
     */
    DisbursementScheduleResponse finalise(Long grantId);

    /** Record that a release criterion has been satisfied. */
    DisbursementScheduleResponse markCriterionMet(Long criterionId, Long userId);

    /** Seed the tranche plan from the fund profile's tranche schedule. */
    DisbursementScheduleResponse prefillFromFundProfile(Long grantId);
}
