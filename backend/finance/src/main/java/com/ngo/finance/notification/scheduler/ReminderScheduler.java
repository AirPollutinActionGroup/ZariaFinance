package com.ngo.finance.notification.scheduler;

import com.ngo.finance.notification.service.ReminderSweepService;
import java.time.LocalDate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Fires the reminder sweep once a day.
 *
 * The sweep itself is idempotent, so the exact time and any missed or repeated
 * run are harmless — a container restart at 01:05 does not lose the day's
 * reminders, and running twice does not double-send.
 */
@Slf4j
@Component
public class ReminderScheduler {

    @Autowired
    private ReminderSweepService reminderSweepService;

    @Value("${zaria.reminders.enabled:true}")
    private boolean enabled;

    /** 01:00 daily by default; override with {@code zaria.reminders.cron}. */
    @Scheduled(cron = "${zaria.reminders.cron:0 0 1 * * *}")
    public void runDailySweep() {
        if (!enabled) {
            log.debug("Reminder sweep disabled");
            return;
        }
        try {
            reminderSweepService.sweep(LocalDate.now());
        } catch (Exception e) {
            // A failed sweep must not kill the scheduler thread: tomorrow's run
            // picks up everything still outstanding.
            log.error("Reminder sweep failed", e);
        }
    }
}
