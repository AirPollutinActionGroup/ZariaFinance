package com.ngo.finance.donation.enums;

/**
 * The two-option lock the spec requires for foreign donors: no free-text bank
 * reference here, only a choice between the domestic account and the FCRA
 * designated account.
 */
public enum DonationBankAccountType {
    DOMESTIC_CURRENT("Domestic — current account"),
    FCRA_DESIGNATED("FCRA designated account");

    private final String label;

    DonationBankAccountType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
