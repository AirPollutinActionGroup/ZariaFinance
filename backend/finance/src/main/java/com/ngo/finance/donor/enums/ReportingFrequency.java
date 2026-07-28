package com.ngo.finance.donor.enums;

public enum ReportingFrequency {
    QUARTERLY("Quarterly"),
    HALF_YEARLY("Half-yearly"),
    ANNUAL("Annual");

    private final String label;

    ReportingFrequency(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
