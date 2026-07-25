package com.ngo.finance.donation.enums;

/**
 * Form 10BE lifecycle. 10BE is what the donor needs to actually claim their
 * deduction (since AY 2022-23) — it is produced from the Form 10BD filing,
 * not from the 80G receipt.
 */
public enum TenBeStatus {
    NOT_APPLICABLE("Not applicable"),
    DUE_AFTER_FY_CLOSE("Due after FY close"),
    PENDING_10BD_FILING("Pending 10BD filing"),
    ISSUED("Issued"),
    OVERDUE("Overdue");

    private final String label;

    TenBeStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
