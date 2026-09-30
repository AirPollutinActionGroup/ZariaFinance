package com.ngo.finance.budget.enums;

import java.util.EnumSet;
import java.util.Set;

/**
 * Budget approval lifecycle: Draft → Submitted → Approved | Rejected.
 * A submitted budget can be withdrawn back to Draft; a rejected one goes back
 * to Draft when it is revised.
 */
public enum BudgetStatus {
    DRAFT,
    SUBMITTED,
    APPROVED,
    REJECTED;

    /** Statuses whose header and lines may still be edited. */
    public static final Set<BudgetStatus> EDITABLE = EnumSet.of(DRAFT, REJECTED);

    public boolean isEditable() {
        return EDITABLE.contains(this);
    }

    public boolean canMoveTo(BudgetStatus target) {
        return switch (this) {
            case DRAFT -> target == SUBMITTED;
            case SUBMITTED -> target == APPROVED || target == REJECTED || target == DRAFT;
            case REJECTED -> target == DRAFT;
            case APPROVED -> false;
        };
    }
}
