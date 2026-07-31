package com.ngo.finance.donor.enums;

public enum ContributionType {
    LC("LC", "Local contribution"),
    FC("FC", "Foreign contribution");

    private final String shortName;
    private final String displayName;

    ContributionType(String shortName, String displayName) {
        this.shortName = shortName;
        this.displayName = displayName;
    }

    public String getShortName() {
        return shortName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
