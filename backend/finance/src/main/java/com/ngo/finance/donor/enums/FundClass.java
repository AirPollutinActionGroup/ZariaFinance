package com.ngo.finance.donor.enums;

/**
 * Fund class enum for Donor and Grant
 */
public enum FundClass {
    CLASS_A_RESTRICTED("Class A – Restricted"),
    CLASS_B_UNRESTRICTED("Class B – Unrestricted"),
    CLASS_C_UNRESTRICTED("Class C – Unrestricted");

    private final String label;

    FundClass(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
