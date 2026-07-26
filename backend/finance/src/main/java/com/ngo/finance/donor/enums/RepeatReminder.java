package com.ngo.finance.donor.enums;

/**
 * How often a reminder repeats until the criterion is actioned (Disbursement
 * Rules §5). {@link #getIntervalDays()} is 0 for ONCE — nothing repeats.
 */
public enum RepeatReminder {
    ONCE("Once", 0),
    EVERY_3_DAYS("Every 3 days", 3),
    WEEKLY("Weekly until actioned", 7);

    private final String label;
    private final int intervalDays;

    RepeatReminder(String label, int intervalDays) {
        this.label = label;
        this.intervalDays = intervalDays;
    }

    public String getLabel() {
        return label;
    }

    public int getIntervalDays() {
        return intervalDays;
    }
}
