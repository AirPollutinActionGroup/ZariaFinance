package com.ngo.finance.donor.enums;

/**
 * Who signs off a milestone criterion (Disbursement Rules §4, Milestone Based).
 * Narrower than {@link ResponsibleRole}: Accounts can be chased for a report but
 * does not verify milestones.
 */
public enum VerificationRole {
    PROGRAMME_MANAGER("Programme Manager"),
    CFO("CFO"),
    HEAD_OF_ORGANISATION("Head of Organisation");

    private final String label;

    VerificationRole(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
