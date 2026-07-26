package com.ngo.finance.donation.enums;

public enum GikRealisationStatus {
    PENDING("Pending"),
    DISTRIBUTED("Distributed"),
    SOLD("Sold"),
    USED("Used"),
    OVERDUE("Overdue — liquidation deadline passed");

    private final String label;

    GikRealisationStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
