package com.ngo.finance.donor.enums;

public enum DonorType {
    CORPORATE("Corporate CSR"),
    INDIVIDUAL("Individual"),
    FOUNDATION("Foundation"),
    GOVERNMENT("Government");

    private final String label;

    DonorType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
