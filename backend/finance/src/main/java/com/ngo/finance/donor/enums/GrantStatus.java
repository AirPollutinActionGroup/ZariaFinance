package com.ngo.finance.donor.enums;

/**
 * Status enum for Grant Agreement
 */
public enum GrantStatus {
    DRAFT("Draft"),
    PENDING_APPROVAL("Pending Approval"),
    APPROVED("Approved"),
    ACTIVE("Active"),
    ON_HOLD("On Hold"),
    COMPLETED("Completed"),
    TERMINATED("Terminated"),
    CLOSED("Closed");

    private final String label;

    GrantStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
