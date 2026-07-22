package com.ngo.finance.donor.enums;

public enum FundSourceDomicile {
    DOMESTIC("Domestic"),
    FOREIGN("Foreign");

    private final String label;

    FundSourceDomicile(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
