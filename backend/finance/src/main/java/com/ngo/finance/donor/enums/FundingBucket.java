package com.ngo.finance.donor.enums;

/**
 * Statutory funding bucket a donor's money falls into for reporting.
 *
 * <ul>
 *   <li>{@code FC}  — Foreign Contribution: FCRA-governed money from a foreign source.</li>
 *   <li>{@code CSR} — Corporate Social Responsibility: domestic corporate CSR spend.</li>
 *   <li>{@code DC}  — Domestic Contribution: every other domestic source (individuals, trusts …).</li>
 * </ul>
 *
 * Classification precedence is FC → CSR → DC: a foreign source is FC regardless of
 * corporate form, and CSR is only meaningful for domestic corporate money.
 */
public enum FundingBucket {
    FC("FC", "Foreign Contribution"),
    CSR("CSR", "Corporate Social Responsibility"),
    DC("DC", "Domestic Contribution");

    private final String code;
    private final String label;

    FundingBucket(String code, String label) {
        this.code = code;
        this.label = label;
    }

    public String getCode() {
        return code;
    }

    public String getLabel() {
        return label;
    }

    /**
     * Classify funding from the three raw signals.
     *
     * @param foreign     whether the source is a foreign contribution (FCRA / foreign domicile)
     * @param donorType   free-text donor type (e.g. "Corporate CSR", "Individual")
     * @param donorSource free-text funding source (e.g. "CSR", "Individual", "Sponsorship")
     */
    public static FundingBucket classify(boolean foreign, String donorType, String donorSource) {
        if (foreign) {
            return FC;
        }
        if (isCsr(donorType) || isCsr(donorSource)) {
            return CSR;
        }
        return DC;
    }

    private static boolean isCsr(String value) {
        return value != null && value.toUpperCase().contains("CSR");
    }
}
