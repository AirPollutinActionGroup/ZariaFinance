package com.ngo.finance.programme;

/**
 * The Programme lifecycle status values. {@code isActive} stays in sync with
 * this as a derived flag (Active -> true, everything else -> false) so
 * existing consumers that only care about active/inactive (e.g. Employee's
 * primary-programme picker) keep working unchanged.
 */
public final class ProgrammeStatuses {

    public static final String PLANNED = "Planned";
    public static final String ACTIVE = "Active";
    public static final String ON_HOLD = "On Hold";
    public static final String COMPLETE = "Complete";
    public static final String CLOSE = "Close";

    /** Bean Validation {@code @Pattern} regexp listing every allowed value. */
    public static final String PATTERN = "Planned|Active|On Hold|Complete|Close";

    private ProgrammeStatuses() {
    }
}
