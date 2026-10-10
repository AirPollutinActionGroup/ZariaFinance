package com.ngo.finance.donor.enums;

public enum FundMode {
    RESTRICTED("Restricted"),
    UNRESTRICTED("Unrestricted");

    private final String label;

    FundMode(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
