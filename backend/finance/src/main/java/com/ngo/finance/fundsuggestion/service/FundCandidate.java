package com.ngo.finance.fundsuggestion.service;

import com.ngo.finance.donor.enums.FundClass;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * A fund that passed the eligibility rules, flattened to what the ranking
 * reads. Grant fields are null when the fund has no grant agreement.
 */
record FundCandidate(
        Long donorId,
        String donorName,
        Long fundProfileId,
        String fundProfileName,
        FundClass fundClass,
        Long grantId,
        String grantCode,
        String grantName,
        LocalDate grantEndDate,
        BigDecimal grantTotal,
        boolean grantPendingApproval,
        BigDecimal received,
        BigDecimal debited,
        long usesOnLine,
        boolean programmeMatch) {

    BigDecimal available() {
        return received.subtract(debited);
    }

    /** With no amount to compare, every candidate counts as covering. */
    boolean covers(BigDecimal amount) {
        return amount == null || available().compareTo(amount) >= 0;
    }
}
