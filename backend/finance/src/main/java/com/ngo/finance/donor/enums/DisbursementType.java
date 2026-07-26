package com.ngo.finance.donor.enums;

/**
 * How a grant's funds are released (Disbursement Rules §1).
 *
 * LUMP_SUM is still stored as a single tranche so that receipts, utilisation and
 * reporting have one shape to read; the difference is only in what the form asks
 * for (a receiving date instead of a cadence and a tranche list).
 */
public enum DisbursementType {
    LUMP_SUM("Lump Sum"),
    TRANCHES("Tranches");

    private final String label;

    DisbursementType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
