package com.ngo.finance.donation.util;

import java.time.LocalDate;
import java.time.Month;

/**
 * Indian financial year (1 Apr – 31 Mar) helpers shared by donation code
 * generation and the tax-chain / 115BBC computations.
 */
public final class FinancialYearUtil {

    private FinancialYearUtil() {
    }

    /** The calendar year the FY containing {@code date} starts in (e.g. 2026 for any date in FY 2026-27). */
    public static int fyStartYear(LocalDate date) {
        return date.getMonthValue() >= Month.APRIL.getValue() ? date.getYear() : date.getYear() - 1;
    }

    public static LocalDate fyStart(LocalDate date) {
        return LocalDate.of(fyStartYear(date), Month.APRIL, 1);
    }

    public static LocalDate fyEnd(LocalDate date) {
        return LocalDate.of(fyStartYear(date) + 1, Month.MARCH, 31);
    }

    /** 31 Mar of the 2nd financial year after {@code receiptDate} — the GIK sale-realisation deadline. */
    public static LocalDate secondFyEndAfter(LocalDate receiptDate) {
        return LocalDate.of(fyStartYear(receiptDate) + 2, Month.MARCH, 31);
    }
}
