package com.ngo.finance.donation.enums;

public enum DonationChannel {
    BANK_TRANSFER("Bank transfer / NEFT / RTGS"),
    CHEQUE("Cheque"),
    CASH("Cash"),
    UPI("UPI"),
    CARD("Card"),
    STANDING_INSTRUCTION("Standing instruction"),
    IN_KIND("In-kind — no cash");

    private final String label;

    DonationChannel(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
