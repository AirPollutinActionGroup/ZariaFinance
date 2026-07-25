package com.ngo.finance.donation.enums;

/**
 * A failed mandate stops forward forecasting and raises a win-back task
 * (follow-up, not built here); a paused mandate suspends but does not cancel
 * the forecast.
 */
public enum MandateStatus {
    ACTIVE,
    PAUSED,
    FAILED,
    CANCELLED
}
