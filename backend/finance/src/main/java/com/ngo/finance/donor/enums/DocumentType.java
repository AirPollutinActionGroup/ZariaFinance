package com.ngo.finance.donor.enums;

/**
 * Document type enum for Grant Document
 */
public enum DocumentType {
    AGREEMENT("Agreement"),
    MOU("MOU"),
    FINANCIAL_STATEMENT("Financial Statement"),
    AUDIT_REPORT("Audit Report"),
    REPORT("Report"),
    DISBURSEMENT("Disbursement"),
    UTILIZATION("Utilization"),
    OTHER("Other");

    private final String label;

    DocumentType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
