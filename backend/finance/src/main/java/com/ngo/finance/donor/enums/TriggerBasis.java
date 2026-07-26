package com.ngo.finance.donor.enums;

/**
 * What a utilisation threshold is measured against (Disbursement Rules §4):
 * the previous tranche alone, or everything released so far.
 */
public enum TriggerBasis {
    PREVIOUS_TRANCHE("Previous Tranche"),
    CUMULATIVE("Cumulative");

    private final String label;

    TriggerBasis(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
