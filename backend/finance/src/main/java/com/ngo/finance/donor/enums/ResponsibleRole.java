package com.ngo.finance.donor.enums;

/**
 * Who is chased when a human-actioned criterion is coming due (Disbursement
 * Rules §5). Resolved to a person and a deputy through the role directory.
 */
public enum ResponsibleRole {
    PROGRAMME_MANAGER("Programme Manager"),
    CFO("CFO"),
    HEAD_OF_ORGANISATION("Head of Organisation"),
    ACCOUNTS("Accounts");

    private final String label;

    ResponsibleRole(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
