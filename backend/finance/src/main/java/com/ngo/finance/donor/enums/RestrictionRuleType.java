package com.ngo.finance.donor.enums;

public enum RestrictionRuleType {
    ADMIN_OVERHEAD_COST("Admin / Overhead Cost"),
    NOT_APPLICABLE("Not applicable"),
    OTHER_CUSTOM("Other (Custom rule)");

    private final String label;

    RestrictionRuleType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
