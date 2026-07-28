package com.ngo.finance.donor.enums;

public enum CriterionType {
    ON_SIGNING("On Signing"),
    FIXED_DATE("Fixed Date"),
    MILESTONE_BASED("Milestone Based"),
    UTILISATION_THRESHOLD("Utilisation Threshold"),
    UTILISATION_CERTIFICATE("Utilisation Certificate (UC)"),
    FINANCIAL_REPORT("Financial Report"),
    NARRATIVE_REPORT("Narrative Report"),
    AUDIT_REPORT("Audit Report"),
    DONOR_APPROVAL("Donor Approval"),
    OTHER("Other");

    private final String label;

    CriterionType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
