package com.ngo.finance.donation.enums;

public enum UtilisationPeriodType {
    SINGLE_FY("Single financial year"),
    MULTI_YEAR("Multi-year"),
    DEFINED_PERIOD("Defined period"),
    PERPETUAL_CORPUS("Perpetual — corpus");

    private final String label;

    UtilisationPeriodType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
