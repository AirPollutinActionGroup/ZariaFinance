package com.ngo.finance.donation.enums;

/**
 * The type of gift received. Drives which conditional block(s) a donation carries.
 */
public enum DonationType {
    MAJOR_GIFT("Major gift / HNI"),
    ONE_TIME("One-time donation"),
    RECURRING("Recurring giving"),
    PAYROLL_GIVING("Payroll giving"),
    LEGACY("Legacy / bequest"),
    GIK("Gift in kind"),
    CORPUS("Corpus");

    private final String label;

    DonationType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
