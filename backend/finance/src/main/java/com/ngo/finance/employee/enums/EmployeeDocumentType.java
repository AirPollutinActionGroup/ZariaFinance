package com.ngo.finance.employee.enums;

/** The identity documents that can be uploaded for an employee — one file of each. */
public enum EmployeeDocumentType {
    PAN_CARD("PAN Card"),
    AADHAAR_CARD("Aadhaar Card");

    private final String label;

    EmployeeDocumentType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
