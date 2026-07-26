package com.ngo.finance.donation.enums;

/**
 * A donation has no "committed" stage — it is recognised as income the moment
 * it lands, unless it's capital (corpus), still in probate (legacy) or a
 * conditional gift the donor can reclaim (deferred income).
 */
public enum RecognitionStatus {
    INCOME_RECOGNISED("Income recognised"),
    DEFERRED_INCOME("Deferred income — conditional gift"),
    CAPITAL_NOT_INCOME("Capital — not income"),
    IN_PROBATE("In probate — not income"),
    PENDING("Pending");

    private final String label;

    RecognitionStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
