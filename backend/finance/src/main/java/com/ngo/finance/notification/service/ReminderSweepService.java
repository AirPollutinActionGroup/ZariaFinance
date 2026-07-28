package com.ngo.finance.notification.service;

import java.time.LocalDate;

/** Turns due reminders into notifications (Disbursement Rules §5). */
public interface ReminderSweepService {

    /**
     * Notify the responsible person (and optionally their deputy) for every unmet
     * criterion whose reminder is due on or before {@code today}.
     *
     * @return how many notifications were written; duplicates are not counted.
     */
    int sweep(LocalDate today);
}
