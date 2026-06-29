package com.ngo.finance.donor.enums;

/**
 * Fund class enum for Donor and Grant
 */
public enum FundClass {
    DOMESTIC("Domestic"),
    INTERNATIONAL("International"),
    GOVERNMENT("Government"),
    CORPORATE("Corporate"),
    INDIVIDUAL("Individual"),
    NGO("NGO");

    private final String label;

    FundClass(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
