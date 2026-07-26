package com.ngo.finance.donor.enums;

/**
 * Tranche cadence (Disbursement Rules §1). Each tranche echoes this as its
 * read-only "Frequency", so it is held once on the schedule rather than copied
 * onto every tranche row.
 */
public enum ScheduleType {
    MONTHLY("Monthly"),
    QUARTERLY("Quarterly"),
    HALF_YEARLY("Half-Yearly"),
    YEARLY("Yearly");

    private final String label;

    ScheduleType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
