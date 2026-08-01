package com.ngo.finance.donation.enums;

/**
 * Intended use — not the item itself — decides the accounting leg for a gift
 * in kind line. Editable after receipt; changes are logged, never overwritten
 * silently (see DonationGikIntendedUseChange).
 */
public enum GikIntendedUse {
    DISTRIBUTE("Distribute — programme expense"),
    SELL("Sell — held for sale, liquidation deadline applies"),
    USE_INTERNALLY("Use internally — expense on consumption"),
    RETAIN_FIXED_ASSET("Retain as fixed asset — capitalise");

    private final String label;

    GikIntendedUse(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
