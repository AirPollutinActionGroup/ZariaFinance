package com.ngo.finance.donor.enums;

public enum ApproverRole {
    CFO("CFO"),
    FINANCE_MANAGER("Finance Manager"),
    PROGRAMME_DIRECTOR("Programme Director"),
    PROGRAMME_MANAGER("Programme Manager"),
    HEAD_OF_ORGANISATION("Head of Organisation"),
    OTHER("Other");

    private final String label;

    ApproverRole(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
