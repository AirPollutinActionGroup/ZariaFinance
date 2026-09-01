package com.ngo.finance.employee;

/**
 * The employee lifecycle status values — shared between request validation
 * and the service layer so the allowed set is defined exactly once.
 */
public final class EmployeeStatuses {

    public static final String ACTIVE = "Active";
    public static final String ON_NOTICE = "On Notice";
    public static final String INACTIVE_RESIGNED = "Inactive – Resigned";
    public static final String INACTIVE_TERMINATED = "Inactive – Terminated";
    public static final String INACTIVE_CONTRACT_ENDED = "Inactive – Contract Ended";

    /** Bean Validation {@code @Pattern} regexp listing every allowed value. */
    public static final String PATTERN =
            "Active|On Notice|Inactive – Resigned|Inactive – Terminated|Inactive – Contract Ended";

    private EmployeeStatuses() {
    }
}
