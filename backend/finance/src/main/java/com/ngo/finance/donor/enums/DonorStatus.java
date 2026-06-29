package com.ngo.finance.donor.enums;

/**
 * Status enum for Donor entity
 */
public enum DonorStatus {
    DRAFT("Draft"),
    PENDING_APPROVAL("Pending Approval"),
    APPROVED("Approved"),
    ONBOARDED("Onboarded"),
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    SUSPENDED("Suspended"),
    TERMINATED("Terminated");

    private final String label;

    DonorStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
