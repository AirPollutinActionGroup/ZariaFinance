package com.ngo.finance.donor.enums;

public enum DisbursementType {
    LUMP_SUM("Lump Sum"),
    TRANCHE("Tranche");

    private final String label;

    DisbursementType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
