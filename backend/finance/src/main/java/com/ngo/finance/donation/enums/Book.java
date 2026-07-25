package com.ngo.finance.donation.enums;

/**
 * Legally separate accounting books. Inherited from the donor's fund-source
 * domicile at save time and immutable after — never a user choice.
 */
public enum Book {
    LC("Local contribution"),
    FC("Foreign contribution");

    private final String label;

    Book(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
