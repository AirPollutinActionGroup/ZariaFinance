package com.ngo.finance.notification.service.impl;

import com.ngo.finance.donor.entity.GrantCriteriaReminder;
import com.ngo.finance.donor.entity.GrantTranche;
import com.ngo.finance.donor.entity.GrantTrancheCriterion;
import com.ngo.finance.donor.repository.GrantTrancheCriterionRepository;
import com.ngo.finance.notification.dto.RoleDirectoryEntryDto;
import com.ngo.finance.notification.service.NotificationService;
import com.ngo.finance.notification.service.ReminderSweepService;
import com.ngo.finance.notification.service.RoleDirectoryService;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Nightly reminder sweep.
 *
 * A reminder is due from {@code expectedReleaseDate − leadDays} onwards. ONCE
 * fires on that day only; the repeating cadences fire again every 3 or 7 days
 * while the criterion stays unmet, including past the release date — an overdue
 * sign-off is exactly when chasing matters most.
 *
 * Idempotency comes from the dedupe key (criterion + fire date + recipient), so
 * running twice in a day, restarting mid-sweep, or two instances sweeping at once
 * cannot double-notify.
 */
@Slf4j
@Service
public class ReminderSweepServiceImpl implements ReminderSweepService {

    @Autowired
    private GrantTrancheCriterionRepository criterionRepository;

    @Autowired
    private RoleDirectoryService roleDirectoryService;

    @Autowired
    private NotificationService notificationService;

    // Not readOnly: the sweep writes notifications. Marking it read-only would put
    // the JDBC transaction in read-only mode and reject the inserts.
    @Override
    @Transactional
    public int sweep(LocalDate today) {
        int delivered = 0;

        for (GrantTrancheCriterion criterion : criterionRepository.findUnmetWithReminders()) {
            GrantCriteriaReminder reminder = criterion.getReminder();
            GrantTranche tranche = criterion.getTranche();
            LocalDate due = reminder.dueDate(tranche.getPlannedReleaseDate());

            if (due == null || !isFiringToday(due, today, reminder)) {
                continue;
            }
            // A tranche whose money has already arrived needs no chasing.
            if (tranche.isReceived()) {
                continue;
            }

            RoleDirectoryEntryDto holder = roleDirectoryService
                    .findByRole(reminder.getResponsibleRole()).orElse(null);
            if (holder == null || holder.getPrimaryUserId() == null) {
                log.warn("Reminder for criterion {} has no holder for role {} — assign one in the role directory",
                        criterion.getId(), reminder.getResponsibleRole());
                continue;
            }

            String title = title(criterion, tranche);
            String body = body(criterion, tranche, due, today);
            String link = "/grants/" + tranche.getGrant().getId() + "/disbursement";

            if (notificationService.deliver(holder.getPrimaryUserId(), title, body, link,
                    "REMINDER", false, dedupeKey(criterion, today, holder.getPrimaryUserId()))) {
                delivered++;
            }

            // The deputy is copied in for visibility only — the responsible role
            // still has to act, and authority does not transfer with the message.
            if (Boolean.TRUE.equals(reminder.getEscalateToDeputy()) && holder.getDeputyUserId() != null) {
                String deputyBody = body + " You are copied as deputy for "
                        + reminder.getResponsibleRole().getLabel()
                        + "; the action remains with " + holder.getPrimaryUserName() + ".";
                if (notificationService.deliver(holder.getDeputyUserId(), title, deputyBody, link,
                        "ESCALATION", true, dedupeKey(criterion, today, holder.getDeputyUserId()))) {
                    delivered++;
                }
            }
        }

        log.info("Reminder sweep for {} delivered {} notification(s)", today, delivered);
        return delivered;
    }

    /** ONCE fires on the due date; repeats fire every interval thereafter. */
    private boolean isFiringToday(LocalDate due, LocalDate today, GrantCriteriaReminder reminder) {
        if (today.isBefore(due)) {
            return false;
        }
        int interval = reminder.getRepeatReminder().getIntervalDays();
        if (interval == 0) {
            return today.isEqual(due);
        }
        return ChronoUnit.DAYS.between(due, today) % interval == 0;
    }

    private String title(GrantTrancheCriterion criterion, GrantTranche tranche) {
        String what = criterion.getCriterionType().getLabel();
        if (criterion.getMilestoneName() != null && !criterion.getMilestoneName().isBlank()) {
            what = what + ": " + criterion.getMilestoneName();
        }
        return what + " due for " + tranche.getGrant().getGrantCode()
                + " tranche " + tranche.getTrancheNumber();
    }

    private String body(GrantTrancheCriterion criterion, GrantTranche tranche,
            LocalDate due, LocalDate today) {
        long overdue = ChronoUnit.DAYS.between(due, today);
        String timing = overdue == 0
                ? "Due today."
                : overdue + " day(s) past the reminder date.";
        return timing + " Tranche " + tranche.getTrancheNumber() + " of "
                + tranche.getGrant().getAgreementName() + " is expected on "
                + tranche.getPlannedReleaseDate() + " and is still waiting on "
                + criterion.getCriterionType().getLabel() + ".";
    }

    private String dedupeKey(GrantTrancheCriterion criterion, LocalDate fireDate, Long userId) {
        return "criterion:" + criterion.getId() + ":date:" + fireDate + ":user:" + userId;
    }
}
