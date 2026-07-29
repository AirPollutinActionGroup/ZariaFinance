package com.ngo.finance.donor.enums;

public enum ScheduleFrequency {
    MONTHLY("Monthly"),
    QUARTERLY("Quarterly"),
    HALF_YEARLY("Half Yearly"),
    YEARLY("Yearly");

    private final String label;

    ScheduleFrequency(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}