package com.ngo.finance.donor.enums;

public enum IdentityDocumentType {
    PAN_CARD("PAN Card"),
    AADHAAR_CARD("Aadhaar Card"),
    VOTER_ID("Voter ID"),
    DRIVING_LICENSE("Driving License"),
    PASSPORT_ID("Passport ID"),
    FOREIGN_TAX_ID("Foreign Tax Identification Number");

    private final String displayName;

    IdentityDocumentType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}