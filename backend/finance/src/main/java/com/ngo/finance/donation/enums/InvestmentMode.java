package com.ngo.finance.donation.enums;

/**
 * Permitted modes of investment for corpus under Section 11(5).
 */
public enum InvestmentMode {
    SCHEDULED_BANK_DEPOSIT("Scheduled bank deposit"),
    GOVERNMENT_SECURITIES("Government securities"),
    POST_OFFICE_SAVINGS("Post office savings"),
    UNITS_OF_UTI("Units of UTI"),
    OTHER_PERMITTED_MODE("Other permitted mode");

    private final String label;

    InvestmentMode(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
