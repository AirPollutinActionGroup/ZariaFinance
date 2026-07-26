package com.ngo.finance.donor.enums;

/**
 * Agreement status entered on the New Grant Agreement Form (section 1).
 *
 * Distinct from the approval workflow ({@code isApproved}: 1 = approved,
 * 2 = pending, 3 = on hold, 4 = completed): a grant can be ACTIVE while its
 * approval is still pending. {@code isActive} mirrors ACTIVE for the queries and
 * lifecycle endpoints that read the boolean.
 */
public enum GrantStatus {
    ACTIVE("Active"),
    COMPLETED("Completed"),
    CANCELLED("Cancelled");

    private final String label;

    GrantStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
