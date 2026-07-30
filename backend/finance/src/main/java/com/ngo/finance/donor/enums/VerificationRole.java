package com.ngo.finance.donor.enums;

/**
 * Who signs off a milestone criterion (Disbursement Rules §4, Milestone Based).
 * Narrower than {@link ResponsibleRole}: Accounts can be chased for a report
 * but
 * does not verify milestones.
 */
public enum VerificationRole {
    CEO("CEO"),
    CFO("CFO"),
    PROGRAMME_MANAGER("Programme Manager"),
    HEAD_OF_ORGANISATION("Head of Organisation"),
    OTHER("Other");

    private final String label;

    VerificationRole(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
