package com.ngo.finance.donor.enums;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

public class FundingBucketTest {

    @Test
    public void foreignSourceIsAlwaysFcRegardlessOfCorporateForm() {
        assertEquals(FundingBucket.FC, FundingBucket.classify(true, "Corporate CSR", "CSR"));
        assertEquals(FundingBucket.FC, FundingBucket.classify(true, "Foundation", "Untied - UC based"));
    }

    @Test
    public void domesticCorporateCsrIsCsr() {
        // CSR signalled by donor type …
        assertEquals(FundingBucket.CSR, FundingBucket.classify(false, "Corporate CSR", "Pre-defined - UC based"));
        // … or by donor source.
        assertEquals(FundingBucket.CSR, FundingBucket.classify(false, "Corporate", "CSR"));
    }

    @Test
    public void otherDomesticSourcesAreDc() {
        assertEquals(FundingBucket.DC, FundingBucket.classify(false, "Individual", "Individual"));
        assertEquals(FundingBucket.DC, FundingBucket.classify(false, "Foundation", "Sponsorship"));
    }

    @Test
    public void nullSignalsFallBackToDc() {
        assertEquals(FundingBucket.DC, FundingBucket.classify(false, null, null));
    }
}
