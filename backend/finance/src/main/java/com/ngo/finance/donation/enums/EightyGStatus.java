package com.ngo.finance.donation.enums;

/**
 * Outcome of the 80G eligibility chain (first-failure-wins).
 */
public enum EightyGStatus {
    NOT_ELIGIBLE_ORG_NOT_REGISTERED("Not eligible — organisation not registered"),
    NOT_ELIGIBLE_GIFT_IN_KIND("Not eligible — gift in kind"),
    NOT_ELIGIBLE_ANONYMOUS("Not eligible — no identified donor to receipt"),
    ELIGIBLE_PENDING_ISSUE("Eligible — receipt will be issued on save"),
    ISSUED("Issued");

    private final String label;

    EightyGStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
