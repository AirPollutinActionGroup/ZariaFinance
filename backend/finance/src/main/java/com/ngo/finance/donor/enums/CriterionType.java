package com.ngo.finance.donor.enums;

/**
 * Release criterion types (Disbursement Rules §4). A tranche may carry several.
 *
 * {@link #isHumanActioned()} decides whether a reminder & escalation block may
 * attach: the spec lists reminders for Milestone Based, UC, Financial Report,
 * Narrative Report, Audit Report and Donor Approval only — Utilisation Threshold
 * is auto-checked by the system, On Signing is instant, and Fixed Date needs no
 * chasing. OTHER is excluded because the spec's list is exhaustive.
 */
public enum CriterionType {
    ON_SIGNING("On Signing", false),
    FIXED_DATE("Fixed Date", false),
    MILESTONE_BASED("Milestone Based", true),
    UTILISATION_THRESHOLD("Utilisation Threshold", false),
    UTILISATION_CERTIFICATE("Utilisation Certificate (UC)", true),
    FINANCIAL_REPORT("Financial Report", true),
    NARRATIVE_REPORT("Narrative Report", true),
    AUDIT_REPORT("Audit Report", true),
    DONOR_APPROVAL("Donor Approval", true),
    OTHER("Other", false);

    private final String label;
    private final boolean humanActioned;

    CriterionType(String label, boolean humanActioned) {
        this.label = label;
        this.humanActioned = humanActioned;
    }

    public String getLabel() {
        return label;
    }

    /** True when someone must act, i.e. a reminder may be configured. */
    public boolean isHumanActioned() {
        return humanActioned;
    }
}
