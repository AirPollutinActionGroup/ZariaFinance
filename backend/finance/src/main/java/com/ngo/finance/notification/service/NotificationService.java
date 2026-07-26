package com.ngo.finance.notification.service;

import com.ngo.finance.notification.dto.NotificationResponse;
import java.util.List;

/** In-app notifications: the delivery side of reminders and escalations. */
public interface NotificationService {

    List<NotificationResponse> list(Long userId, boolean unreadOnly, int limit);

    long unreadCount(Long userId);

    void markRead(Long notificationId);

    int markAllRead(Long userId);

    /**
     * Creates a notification unless {@code dedupeKey} has already been used.
     *
     * @return true when a row was written, false when it was a duplicate.
     */
    boolean deliver(Long userId, String title, String body, String link,
            String category, boolean escalation, String dedupeKey);
}
