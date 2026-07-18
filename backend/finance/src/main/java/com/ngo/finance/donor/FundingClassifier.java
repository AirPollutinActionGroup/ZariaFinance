package com.ngo.finance.donor;

import com.ngo.finance.donor.entity.DonorMaster;
import com.ngo.finance.donor.enums.FundingBucket;

/**
 * Single source of truth for placing a donor's funding into the FC / DC / CSR
 * buckets (see {@link FundingBucket}). Both the dashboard summary and the FCRA
 * register derive their "foreign vs domestic" split from here so the two never
 * drift apart.
 */
public final class FundingClassifier {

    private FundingClassifier() {}

    /**
     * A donor is a foreign contribution when FCRA applies to it, or its fund
     * source is domiciled abroad. Matches the FCRA-register inclusion rule.
     */
    public static boolean isForeign(DonorMaster donor) {
        if (donor == null) {
            return false;
        }
        return Boolean.TRUE.equals(donor.getFcraApplicable())
                || "Foreign".equalsIgnoreCase(donor.getFundSourceDomicile());
    }

    /** Classify a donor into its FC / DC / CSR bucket. */
    public static FundingBucket classify(DonorMaster donor) {
        if (donor == null) {
            return FundingBucket.DC;
        }
        return FundingBucket.classify(isForeign(donor), donor.getDonorType(), donor.getDonorSource());
    }
}
