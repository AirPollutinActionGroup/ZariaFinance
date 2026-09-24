package com.ngo.finance.common.enums;

public enum TransactionType {
    DEBIT("Debit (Out)"),
    CREDIT("Credit (In)");

    private final String displayName;

    TransactionType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
