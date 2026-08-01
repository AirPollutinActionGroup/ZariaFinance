package com.ngo.finance.donation.enums;

/**
 * How a gift-in-kind item's fair value was established — the evidentiary
 * basis, not the value itself. Drives what {@code valuationSource} is
 * expected to actually contain.
 */
public enum GikValuationBasis {
    MARKET_QUOTATION("Market quotation"),
    SUPPLIER_INVOICE("Supplier invoice"),
    REGISTERED_VALUER_CERTIFICATE("Registered valuer certificate"),
    DONOR_DECLARATION("Donor declaration");

    private final String label;

    GikValuationBasis(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
